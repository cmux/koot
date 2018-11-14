import React from 'react'
import HTMLTool from './HTMLTool'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, RouterContext, match } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'

import { changeLocaleQueryKey } from '../defaults/defines'
import { publicPathPrefix } from '../defaults/webpack-dev-server'

import {
    setStore,
    setHistory,
    setExtender,
    setPageinfo,
} from '../'
import { localeId } from '../i18n'
import RenderCache from './render-cache'

import onRequestGetStore from './server/on-request/get-store'

import renderTemplate from '../React/render-template'
import componentExtender from '../React/component-extender'
import pageinfo from '../React/pageinfo'
import {
    get as getStyles,
} from '../React/styles'
import validateInject from '../React/validate-inject'

const getChunkmap = require('../utils/get-chunkmap')
const getSWPathname = require('../utils/get-sw-pathname')

const error = require('debug')('SYSTEM:isomorphic:error')

// 设置全局常量
setExtender(componentExtender)
setPageinfo(pageinfo)

export default class ReactIsomorphic {

    /** 
     * @param {Object} options
     * @param {Number} [options.cacheMaxAge] 渲染结果缓存存在时间 (单位: ms)
     */
    createKoaMiddleware(options = {
        routes: [],
        configStore: () => { },
        onServerRender: () => { },
        inject: { /*key: value*/ } // 在html中会这样替换 <script>inject_[key]</script>  => value
    }) {

        /*
        同构中间件流程：
    
        根据router计算出渲染页面需要的数据，并把渲染需要的数据补充到store中
        补充服务端提供的信息数据到store中
        把同构时候服务端预处理数据补充到store中
    
        把react部分渲染出html片段，并插入到html中
        html 处理：
            向html中注入引用文件链接
            把同构时候服务端预处理数据补充到html中
            调整样式位置，从下到上
        */

        const {
            onServerRender,
            inject,
            configStore, store: _store,
            routes,
            renderCache: optionRenderCache,
        } = options
        let {
            template
        } = options
        // const ENV = process.env.WEBPACK_BUILD_ENV

        /** @type {Map} 渲染结果缓存 */
        let renderCache

        /** @type {Object} 静态注入内容（一次服务器进程内不会更改的部分） */
        const injectOnce = {}
        /**
         * @type {Object}
         * 注入内容缓存
         * 如果是多语言分包模式，则第一级为语种 ID
         */
        const injectOnceCache = {}

        /** @type {Object} chunkmap */
        const chunkmap = getChunkmap(true)
        /** @type {Object} webpack 的入口，从 chunkmap 中抽取 */
        let entrypoints = {}
        /** @type {Object} 文件名与实际结果的文件名的对应表，从 chunkmap 中抽取 */
        let filemap = {}

        /** @type {Boolean} i18n 是否启用 */
        const i18nEnabled = JSON.parse(process.env.KOOT_I18N)
        /** @type {Array} i18n 配置数组 */
        const i18nLocales = i18nEnabled
            ? JSON.parse(process.env.KOOT_I18N_LOCALES)
            : []
        /** @type {String|undefined} i18n 类型 */
        const i18nType = i18nEnabled
            ? JSON.parse(process.env.KOOT_I18N_TYPE)
            : undefined
        /** @type {Boolean} i18n 类型是否是默认 (分包) 形式 */
        const isI18nDefault = (i18nType === 'default')

        /** @type {Boolean} 同构内容是否为静态注入（一次服务器session内不会更改）。i18n 类型不为分包形式时为 true */
        const isIsormorphicInjectOnce = !isI18nDefault

        // 针对 i18n 分包形式的项目，静态注入按语言缓存
        if (isI18nDefault) {
            renderCache = new Map()
            for (let l in chunkmap) {
                const thisLocaleId = l.substr(0, 1) === '.' ? l.substr(1) : l
                entrypoints[thisLocaleId] = chunkmap[l]['.entrypoints']
                filemap[thisLocaleId] = chunkmap[l]['.files']
                injectOnceCache[thisLocaleId] = {
                    pathnameSW: getSWPathname(thisLocaleId)
                }
                renderCache.set(thisLocaleId, new RenderCache(optionRenderCache))
            }
        } else {
            entrypoints = chunkmap['.entrypoints']
            filemap = chunkmap['.files']
            injectOnceCache.pathnameSW = getSWPathname()
            renderCache = new RenderCache(optionRenderCache)
        }

        // koa 中间件结构
        // 每次请求时均会执行
        return async (ctx, next) => {

            // console.log(' ')
            // console.log('ctx.url', ctx.url)
            // console.log('ctx.originalUrl', ctx.originalUrl)
            // console.log('ctx.origin', ctx.origin)
            // console.log('ctx.href', ctx.href)
            // console.log('ctx.path', ctx.path)
            // console.log('ctx.querystring', ctx.querystring)
            // console.log('ctx.search', ctx.search)
            // console.log('ctx.hash', ctx.hash)
            // console.log(' ')

            /** @type {String} 本次请求的 URL */
            const url = ctx.path + ctx.search

            try {
                // if (__DEV__) {
                //     console.log(' ')
                //     console.log('server', 'Server rendering...')
                // }

                const store = onRequestGetStore( _store || configStore )
                const memoryHistory = createMemoryHistory(url)
                const history = syncHistoryWithStore(memoryHistory, store)
                
                // 补充服务端提供的信息数据到store中
                if (typeof onServerRender === 'function') {
                    await onServerRender({ ctx, store })
                }

                // 根据router计算出渲染页面需要的数据，并把渲染需要的数据补充到store中
                const {
                    redirectLocation,
                    renderProps
                } = await asyncReactRouterMatch({ history, routes, location: url })

                // console.log('renderProps', renderProps)

                // 判断是否重定向页面
                if (redirectLocation)
                    return ctx.redirect(redirectLocation.pathname + redirectLocation.search)
                if (!renderProps)
                    return await next()

                // 设置常量
                setStore(store)
                setHistory(history)

                // 把同构时候服务端预处理数据补充到store中
                await ServerRenderDataToStore({ store, renderProps, ctx })

                // 把同构时候服务端预处理数据补充到html中(根据页面逻辑动态修改html内容)
                const htmlTool = await ServerRenderHtmlExtend({ store, renderProps, ctx })

                // 把react部分渲染出html片段，并插入到html中
                const reactHtml = renderToString(
                    <Provider store={store} >
                        <RouterContext {...renderProps} />
                    </Provider>
                )

                /** @type {Object} 本次请求的渲染结果缓存 */
                const thisRenderCache = isIsormorphicInjectOnce ? renderCache : renderCache.get(localeId)

                // 如果当前缓存可用，直接输出结果
                const cacheResult = thisRenderCache.get(url)
                if (!__DEV__ && cacheResult !== false) {
                    ctx.body = cacheResult
                    return
                }

                /** @type {Object} 本次请求的静态注入对象/本次请求的当前语言的静态注入缓存对象 */
                const thisInjectOnceCache = isIsormorphicInjectOnce ? injectOnceCache : injectOnceCache[localeId]
                /** @type {Object} 本次请求的 (当前语言的) 文件名对应表 */
                const thisFilemap = isIsormorphicInjectOnce ? filemap : filemap[localeId]
                /** @type {Object} 本次请求的 (当前语言的) 入口表 */
                const thisEntrypoints = isIsormorphicInjectOnce ? entrypoints : entrypoints[localeId]

                // const filterResult = filterStyle(reactHtml)
                // CSS 同构结果片段
                const styles = getStyles()
                const reactStyles = Object.keys(styles)
                    .map(wrapper => (
                        `<style id="${wrapper}">${styles[wrapper].css}</style>`
                    ))
                    .join('')

                // console.log(chunkmap)
                // console.log(filemap)
                // console.log(entrypoints)
                // console.log(localeId)
                // console.log(thisInjectOnceCache)
                // console.log(thisFilemap)
                // console.log(thisEntrypoints)

                // global.koaCtxOrigin = ctx.origin

                // 开发模式: 将 content('critical.js') 转为 pathname()
                if (__DEV__)
                    template = template
                        // .replace(
                        //     /<style(.*?)><%(.*?)content\(['"]critical\.css['"]\)(.*?)%><\/style>/,
                        //     `<link id="__koot-critical-styles" media="all" rel="stylesheet" href="<%$2pathname('critical.css')$3%>" />`
                        // )
                        .replace(
                            /<script(.*?)><%(.*?)content\(['"]critical\.js['"]\)(.*?)%><\/script>/,
                            `<script$1 src="<%$2pathname('critical.js')$3%>"></script>`
                        )

                /** @type {Object} 实时 (本次访问请求) 注入 */
                const injectRealtime = validateInject({
                    injectCache: thisInjectOnceCache,
                    filemap: thisFilemap,
                    entrypoints: thisEntrypoints,
                    localeId,
                    title: htmlTool.getTitle(),
                    metaHtml: htmlTool.getMetaHtml(),
                    reactHtml,
                    stylesHtml: reactStyles,
                    reduxHtml: htmlTool.getReduxScript(store),
                    needInjectCritical: {
                        styles: !/(content|pathname)\(['"]critical\.css['"]\)/.test(template),
                        scripts: !/(content|pathname)\(['"]critical\.js['"]\)/.test(template),
                    },
                })

                // i18n 启用时: 添加其他语种页面跳转信息的 meta 标签
                if (i18nEnabled) {
                    const localeIds = i18nLocales.map(arr => arr[0])
                    // console.log('localeIds', localeIds)
                    // console.log('ctx.query', ctx.query)
                    // console.log('ctx.querystring', ctx.querystring)
                    injectRealtime.metas += localeIds
                        .map(l => {
                            const href = (typeof ctx.query[changeLocaleQueryKey] === 'string')
                                ? ctx.href.replace(
                                    new RegExp(`${changeLocaleQueryKey}=[a-zA-Z-_]+`),
                                    `${changeLocaleQueryKey}=${l}`
                                )
                                : ctx.href + (ctx.querystring ? `&` : (
                                    ctx.href.substr(ctx.href.length - 1) === '?'
                                        ? ''
                                        : `?`
                                )) + `${changeLocaleQueryKey}=${l}`
                            return `<link rel="alternate" hreflang="${l}" href="${href}" />`
                        })
                        .join('')
                }

                // 渲染模板
                let html = renderTemplate(template, Object.assign(injectRealtime, injectOnce, inject))

                // 开发模式:
                if (__DEV__) {
                    // 将结果中指向 webpack-dev-server 的 URL 转换为指向本服务器的代理地址
                    // 替换 localhost 为 origin，以允许外部请求访问

                    delete thisInjectOnceCache.styles
                    delete thisInjectOnceCache.scriptsInBody
                    // delete thisInjectOnceCache.pathnameSW

                    const origin = ctx.origin.split('://')[1]
                    // origin = origin.split(':')[0]
                    html = html.replace(
                        /:\/\/localhost:([0-9]+)/mg,
                        `://${origin}/${publicPathPrefix}`
                    )
                } else {
                    // HTML 结果暂存入缓存
                    thisRenderCache.set(url, html)
                }


                // 渲染输出
                ctx.body = html

                // global.koaCtxOrigin = undefined

            } catch (e) {
                // console.error('Server-Render Error Occures: %s', e.stack)
                error('Server-Render Error Occures: %O', e.stack)
                ctx.status = 500
                ctx.body = e.message
                ctx.app.emit('error', e, ctx)
            }
        }
    }

}

// location 解构：
// { history, routes, location }
function asyncReactRouterMatch(location) {
    return new Promise((resolve, reject) => {
        match(location, (error, redirectLocation, renderProps) => {
            if (error) {
                return reject(error)
            }

            resolve({ redirectLocation, renderProps })
        })
    })
}

/**
 * 服务端渲染时扩展redux的store方法
 * 注：组件必须是redux包装过的组件
 * 
 * @param {any} store 
 * @param {any} renderProps 
 * @returns 
 */
function ServerRenderDataToStore({ store, renderProps, ctx }) {

    const SERVER_RENDER_EVENT_NAME = 'onServerRenderStoreExtend'

    let serverRenderTasks = []
    for (let component of renderProps.components) {

        // component.WrappedComponent 是redux装饰的外壳
        if (component && component.WrappedComponent && component.WrappedComponent[SERVER_RENDER_EVENT_NAME]) {

            // 预处理异步数据的
            const tasks = component.WrappedComponent[SERVER_RENDER_EVENT_NAME]({
                store,
                renderProps,
                ctx,
            })
            if (Array.isArray(tasks)) {
                serverRenderTasks = serverRenderTasks.concat(tasks)
            } else if (tasks.then) {
                serverRenderTasks.push(tasks)
            }
        }
    }

    return Promise.all(serverRenderTasks)
}

/**
 * 服务端渲染时候扩展html的方法
 * 注：组件必须是redux包装过的组件
 * 
 * @param {any} store 
 * @param {any} renderProps 
 * @returns 
 */
function ServerRenderHtmlExtend({ store, renderProps, ctx }) {

    const SERVER_RENDER_EVENT_NAME = 'onServerRenderHtmlExtend'
    const htmlTool = new HTMLTool()

    // component.WrappedComponent 是redux装饰的外壳
    let func
    for (let component of renderProps.components) {
        if (component && component.WrappedComponent && component.WrappedComponent[SERVER_RENDER_EVENT_NAME]) {
            func = component.WrappedComponent[SERVER_RENDER_EVENT_NAME]
        }
    }

    if (typeof func === 'function')
        func({
            htmlTool,
            store,
            renderProps,
            ctx,
        })

    return htmlTool
}
