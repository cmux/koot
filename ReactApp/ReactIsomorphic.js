import React from 'react'
import HTMLTool from './HTMLTool'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, RouterContext, match } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'

import htmlInject from './inject'
import { localeId } from '../i18n'
import {
    setStore,
    setHistory,
    setPageinfo,
} from '../'
import pageinfo from '../React/pageinfo'

const path = require('path')

const defaultEntrypoints = require('../defaults/entrypoints')
const getChunkmap = require('../utils/get-chunkmap')
const getClientFilePath = require('../utils/get-client-file-path')
const readClientFile = require('../utils/read-client-file')
const getSWPathname = require('../utils/get-sw-pathname')

const error = require('debug')('SYSTEM:isomorphic:error')

const injectOnceCache = {}

// 设置全局常量
setPageinfo(pageinfo)

export default class ReactIsomorphic {

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

        // 设置常量
        const { template, onServerRender, inject, configStore, routes } = options
        const ENV = process.env.WEBPACK_BUILD_ENV

        // 配置 html 注入内容
        // html [只更新1次]的部分
        const injectOnce = {
            // js: inject.js ? inject.js.map((js) => `<script src="${js}" defer></script>`).join('') : '', // 引用js文件标签
            // css: inject.css ? inject.css.map((css) => `<link rel="stylesheet" href="${css}">`).join('') : '', // 引用css文件标签
        }

        // 处理 chunkmap
        const chunkmap = getChunkmap(true)
        let entrypoints = {}
        let filemap = {}

        // 分析当前 i18n 模式
        const i18nType = JSON.parse(process.env.KOOT_I18N)
            ? JSON.parse(process.env.KOOT_I18N_TYPE)
            : undefined
        const isI18nDefault = (i18nType === 'default')

        // 针对 i18n 分包形式的项目，单次注入按语言缓存
        const assetsInjectOnce = !isI18nDefault
        if (isI18nDefault) {
            for (let l in chunkmap) {
                const thisLocaleId = l.substr(0, 1) === '.' ? l.substr(1) : l
                entrypoints[thisLocaleId] = chunkmap[l]['.entrypoints']
                filemap[thisLocaleId] = chunkmap[l]['.files']
                injectOnceCache[thisLocaleId] = {
                    pathnameSW: getSWPathname(thisLocaleId)
                }
            }
        } else {
            entrypoints = chunkmap['.entrypoints']
            filemap = chunkmap['.files']
            injectOnceCache.pathnameSW = getSWPathname()
        }

        // koa 中间件结构
        // 每次请求时均会执行
        return async (ctx, next) => {

            const url = ctx.path + ctx.search
            try {

                const memoryHistory = createMemoryHistory(url)
                const store = configStore()
                const history = syncHistoryWithStore(memoryHistory, store)

                // 根据router计算出渲染页面需要的数据，并把渲染需要的数据补充到store中

                const { redirectLocation, renderProps } = await asyncReactRouterMatch({ history, routes, location: url })

                // 判断是否重定向页面
                if (redirectLocation) return ctx.redirect(redirectLocation.pathname + redirectLocation.search)
                if (!renderProps) return await next()

                // 设置常量
                setStore(store)
                setHistory(history)

                // 补充服务端提供的信息数据到store中
                if (typeof onServerRender === 'function')
                    await onServerRender({ ctx, store })

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
                const filterResult = filterStyle(reactHtml)

                const thisInjectOnceCache = assetsInjectOnce ? injectOnceCache : injectOnceCache[localeId]
                const thisFilemap = assetsInjectOnce ? filemap : filemap[localeId]
                const thisEntrypoints = assetsInjectOnce ? entrypoints : entrypoints[localeId]

                // console.log(chunkmap)
                // console.log(filemap)
                // console.log(entrypoints)
                // console.log(localeId)
                // console.log(thisInjectOnceCache)
                // console.log(thisFilemap)
                // console.log(thisEntrypoints)

                // 配置 html 注入内容
                // html [实时更新]的部分
                const injectRealtime = {
                    htmlLang: localeId ? ` lang="${localeId}"` : '',
                    title: htmlTool.getTitle(),
                    metas: `<!--${__KOOT_INJECT_METAS_START__}-->${htmlTool.getMetaHtml()}<!--${__KOOT_INJECT_METAS_END__}-->`,
                    styles: (() => {
                        if (!assetsInjectOnce || typeof thisInjectOnceCache.styles === 'undefined') {
                            let r = ''
                            if (typeof thisFilemap['critical.css'] === 'string') {
                                if (ENV === 'prod')
                                    r += `<style id="__koot-critical-styles" type="text/css">${readClientFile('critical.css')}</style>`
                                if (ENV === 'dev')
                                    r += `<link id="__koot-critical-styles" media="all" rel="stylesheet" href="${getClientFilePath('critical.css')}" />`
                            }
                            thisInjectOnceCache.styles = r
                        }
                        return thisInjectOnceCache.styles + filterResult.style
                    })(),
                    react: filterResult.html,
                    scripts: (() => {
                        if (!assetsInjectOnce || typeof thisInjectOnceCache.scriptsInBody === 'undefined') {
                            let r = ''

                            // 优先引入 critical
                            if (Array.isArray(thisEntrypoints.critical)) {
                                thisEntrypoints.critical
                                    .filter(file => path.extname(file) === '.js')
                                    .forEach(file => {
                                        if (ENV === 'prod')
                                            r += `<script type="text/javascript">${readClientFile(true, file)}</script>`
                                        if (ENV === 'dev')
                                            r += `<script type="text/javascript" src="${getClientFilePath(true, file)}"></script>`
                                    })
                            }

                            // 引入其他入口
                            // Object.keys(thisEntrypoints).filter(key => (
                            //     key !== 'critical' && key !== 'polyfill'
                            // ))
                            defaultEntrypoints.forEach(key => {
                                if (Array.isArray(thisEntrypoints[key])) {
                                    thisEntrypoints[key].forEach(file => {
                                        if (ENV === 'prod')
                                            r += `<script type="text/javascript" src="${getClientFilePath(true, file)}" defer></script>`
                                        if (ENV === 'dev')
                                            r += `<script type="text/javascript" src="${getClientFilePath(true, file)}" defer></script>`
                                    })
                                }
                            })

                            // 如果设置了 PWA 自动注册 Service-Worker，在此注册
                            const pwaAuto = typeof process.env.KOOT_PWA_AUTO_REGISTER === 'string'
                                ? JSON.parse(process.env.KOOT_PWA_AUTO_REGISTER)
                                : false
                            if (pwaAuto && typeof thisInjectOnceCache.pathnameSW === 'string') {
                                r += `<script id="__koot-pwa-register-sw" type="text/javascript">`
                                if (ENV === 'prod')
                                    r += `if ('serviceWorker' in navigator) {`
                                        + `navigator.serviceWorker.register("${thisInjectOnceCache.pathnameSW}",`
                                        + `{scope: '/'}`
                                        + `)`
                                        + `.catch(err => {console.log('👩‍💻 Service Worker SUPPORTED. ERROR', err)})`
                                        + `}else{console.log('👩‍💻 Service Worker not supported!')}`
                                if (ENV === 'dev')
                                    r += `console.log('👩‍💻 No Service Worker for DEV mode.')`
                                r += `</script>`
                            }

                            thisInjectOnceCache.scriptsInBody = r
                        }
                        return `<script type="text/javascript">${htmlTool.getReduxScript(store)}</script>`
                            + thisInjectOnceCache.scriptsInBody
                    })(),
                }

                const injectResult = Object.assign({}, injectRealtime, injectOnce, inject)

                // 响应给客户端

                const html = htmlInject(template, injectResult)
                ctx.body = html


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

// TODO: move to ImportStyle npm
// 样式处理
// serverRender 的时候，react逻辑渲染的css代码会在html比较靠后的地方渲染出来，
// 为了更快的展现出正常的网页样式，在服务端处理的时候用正则表达式把匹配到的css
// 移动到html的header里，让页面展现更快。
function filterStyle(htmlString) {

    // 获取样式代码
    let styleCollectionString = htmlString
        .replace(/\r\n/gi, '')
        .replace(/\n/gi, '')
        .match(/<div id="styleCollection(.*?)>(.*?)<\/div>/gi)[0]

    // 提取 css
    let style = styleCollectionString.substr(styleCollectionString.indexOf('>') + 1, styleCollectionString.length)
    style = style.substr(0, style.length - 6)

    // 去掉 <div id="styleCollection">...</div>
    let html = htmlString.replace(/\n/gi, '').replace(styleCollectionString, '')

    return {
        html,
        style
    }
}
