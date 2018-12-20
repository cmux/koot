/* global
    Store:false,
    History:false,
    LocaleId:false,
    __KOOT_SSR__:false
*/

import React from 'react'
import { renderToString } from 'react-dom/server'
import RootIsomorphic from './root-isomorphic'
import match from 'react-router/lib/match'

import * as kootConfig from '__KOOT_PROJECT_CONFIG_PATHNAME__'

import { publicPathPrefix } from '../../defaults/webpack-dev-server'

import getChunkmap from '../../utils/get-chunkmap'
import getSWPathname from '../../utils/get-sw-pathname'
import { CHANGE_LANGUAGE } from '../action-types'

import validateRouterConfig from '../../React/validate/router-config'
import validateInject from '../../React/validate-inject'
import isNeedInjectCritical from '../../React/inject/is-need-inject-critical'
import renderTemplate from '../../React/render-template'

import validateTemplate from './validate/template'
import validateI18n from './validate/i18n'
// import createRenderCacheMap from './validate/create-render-cache-map'

import beforeRouterMatch from './middlewares/isomorphic/lifecycle/before-router-match'
import beforeDataToStore from './middlewares/isomorphic/lifecycle/before-data-to-store'
import afterDataToStore from './middlewares/isomorphic/lifecycle/after-data-to-store'
import executeComponentsLifecycle from './middlewares/isomorphic/execute-components-lifecycle'

import i18nOnServerRender from '../../i18n/onServerRender'
import i18nGenerateHtmlRedirectMetas from '../../i18n/server/generate-html-redirect-metas'

const ssr = async () => {

    const { ctx, styleMap, ssrConfig } = __KOOT_SSR__
    console.log('eval started', {
        __TEST_NUMBER__,
        LocaleId,
        'is __KOOT_SSR__': __KOOT_SSR__.LocaleId
    })

    /** @type {String} 本次请求的 URL */
    const url = ctx.path + ctx.search

    /** @type {Boolean} i18n 是否启用 */
    const i18nEnabled = Boolean(LocaleId)

    await initConfig(i18nEnabled)
    const {
        lifecycle,
        templateInject,
        proxyRequestOrigin,

        template,
        syncCookie,
        routerConfig: routes,
        // renderCacheMap,

        templateInjectCache,
        entrypoints,
        filemap,
    } = ssrConfig

    // setLocaleId(LocaleId)

    /** @type {Object} 本次请求的 (当前语言的) 注入内容缓存 */
    const thisTemplateInjectCache = templateInjectCache.get(LocaleId)
    /** @type {Object} 本次请求的 (当前语言的) 入口表 */
    const thisEntrypoints = entrypoints.get(LocaleId)
    /** @type {Object} 本次请求的 (当前语言的) 文件名对应表 */
    const thisFilemap = filemap.get(LocaleId)
    // /** @type {Object} 本次请求的 (当前语言的) CSS 对照表 */
    // const thisStyleMap = styleMap.get(LocaleId)

    // 渲染生命周期: beforeRouterMatch
    await beforeRouterMatch({
        store: Store,
        ctx,
        syncCookie,
        callback: lifecycle.beforeRouterMatch
    })
    if (LocaleId) {
        if (__DEV__) await validateI18n()
        Store.dispatch({ type: CHANGE_LANGUAGE, data: LocaleId })
        i18nOnServerRender({ store: Store })
    }

    // 进行路由匹配
    const {
        redirectLocation, renderProps
    } = await new Promise((resolve, reject) => {
        console.log('match', {
            'in __KOOT_SSR__': __KOOT_SSR__.LocaleId
        })
        match({
            history: History,
            routes,
            location: url,
        }, (error, redirectLocation, renderProps) => {
            if (error) return reject(error)
            resolve({ redirectLocation, renderProps })
        })
    })

    // 如果需要重定向，派发 ctx.redirect / 302
    if (redirectLocation) {
        __KOOT_SSR__.__RESULT__ = {
            redirect: redirectLocation.pathname + redirectLocation.search
        }
        return
    }

    // 如果没有匹配，终止本中间件流程，执行其他中间件
    // 表示 react 不应处理该请求
    if (!renderProps) {
        __KOOT_SSR__.__RESULT__ = {
            next: true
        }
        return
    }

    // 渲染生命周期: beforeDataToStore
    await beforeDataToStore({
        store: Store,
        ctx,
        LocaleId: LocaleId,
        callback: lifecycle.beforeDataToStore
    })

    // 执行所有匹配到的组件的自定义的静态生命周期
    const {
        title, metaHtml, reduxHtml
    } = await executeComponentsLifecycle({ store: Store, renderProps, ctx })

    // 渲染生命周期: afterDataToStore
    await afterDataToStore({
        store: Store,
        ctx,
        callback: lifecycle.afterDataToStore
    })

    // SSR
    const reactHtml = renderToString(
        <RootIsomorphic
            store={Store}
            {...renderProps}
        />
    )
    // const stylesHtml = Object.keys(thisStyleMap)
    //     .filter(id => typeof thisStyleMap[id].css === 'string')
    //     .map(id => `<style id="${id}">${thisStyleMap[id].css}</style>`)
    //     .join('')
    const stylesHtml = Object.keys(styleMap)
        .filter(id => typeof styleMap[id].css === 'string')
        .map(id => `<style id="${id}">${styleMap[id].css}</style>`)
        .join('')
    // console.log('result thisStyleMap', thisStyleMap)
    const serverState = {
        localeId: LocaleId,
    }

    // 渲染 EJS 模板
    const inject = validateInject({
        injectCache: thisTemplateInjectCache,
        filemap: thisFilemap,
        entrypoints: thisEntrypoints,
        localeId: LocaleId,
        title,
        metaHtml,
        reactHtml,
        stylesHtml,
        reduxHtml,
        serverState,
        needInjectCritical: isNeedInjectCritical(template),
    })
    if (LocaleId) {
        // i18n 启用时: 添加其他语种页面跳转信息的 meta 标签
        inject.metas += i18nGenerateHtmlRedirectMetas({
            ctx,
            proxyRequestOrigin,
            localeId: LocaleId
        })
    }

    /** @type {String} HTML 结果 */
    let body = renderTemplate({
        template,
        inject: Object.assign({
            ...inject,
            ...templateInject
        }),
        store: Store
    })

    // 结果写入缓存
    if (__DEV__) {
        // 将结果中指向 webpack-dev-server 的 URL 转换为指向本服务器的代理地址
        // 替换 localhost 为 origin，以允许外部请求访问
        delete templateInjectCache.styles
        delete templateInjectCache.scriptsInBody
        // delete thisTemplateInjectCache.pathnameSW

        const origin = ctx.origin.split('://')[1]
        // origin = origin.split(':')[0]
        body = body.replace(
            /:\/\/localhost:([0-9]+)/mg,
            `://${origin}/${publicPathPrefix}`
        )
    }

    // React SSR
    __KOOT_SSR__.__RESULT__ = {
        body
    }
}

/**
 * 初始化 SSR 配置
 * @param {*} i18nEnabled 
 */
const initConfig = async (i18nEnabled) => {

    if (!__KOOT_SSR__.ssrConfig)
        return {}

    // 决定路由配置
    __KOOT_SSR__.ssrConfig.routerConfig = await validateRouterConfig(kootConfig.router)

    if (__KOOT_SSR__.ssrConfig._init)
        return __KOOT_SSR__.ssrConfig
    
    console.log(' !! INIT !! ')

    if (typeof i18nEnabled === 'undefined')
        i18nEnabled = Boolean(LocaleId)

    const {
        server: serverConfig = {},
    } = kootConfig
    const {
        // renderCache: renderCacheConfig = {},
        inject: templateInject,
        proxyRequestOrigin = {},
    } = serverConfig
    __KOOT_SSR__.ssrConfig.lifecycle = {}
    if (typeof serverConfig.onRender === 'function') {
        __KOOT_SSR__.ssrConfig.lifecycle.afterDataToStore = serverConfig.onRender
    } else if (typeof serverConfig.onRender === 'object') {
        Object.keys(serverConfig.onRender).forEach(key => {
            __KOOT_SSR__.ssrConfig.lifecycle[key] = serverConfig.onRender[key]
        })
    }

    // 决定模板内容 (String)
    __KOOT_SSR__.ssrConfig.template = await validateTemplate(kootConfig.template)

    // 决定路由配置
    __KOOT_SSR__.ssrConfig.routerConfig = await validateRouterConfig(kootConfig.router)

    // 语言包写入内存
    await validateI18n()

    // 创建渲染缓存 Map
    // __KOOT_SSR__.ssrConfig.renderCacheMap = await createRenderCacheMap(renderCacheConfig)

    // 其他选项
    __KOOT_SSR__.ssrConfig.templateInject = templateInject
    __KOOT_SSR__.ssrConfig.proxyRequestOrigin = proxyRequestOrigin

    /**
     * @type {Map}
     * 注入内容缓存
     * 则第一级为语种ID或 `` (空字符串)
     */
    __KOOT_SSR__.ssrConfig.templateInjectCache = new Map()

    /** @type {Object} chunkmap */
    __KOOT_SSR__.ssrConfig.chunkmap = getChunkmap(true)
    /** @type {Map} webpack 的入口，从 chunkmap 中抽取 */
    __KOOT_SSR__.ssrConfig.entrypoints = new Map()
    /** @type {Map} 文件名与实际结果的文件名的对应表，从 chunkmap 中抽取 */
    __KOOT_SSR__.ssrConfig.filemap = new Map()

    /** @type {String} i18n 类型 */
    const i18nType = i18nEnabled
        ? JSON.parse(process.env.KOOT_I18N_TYPE)
        : undefined

    // 针对 i18n 分包形式的项目，静态注入按语言缓存
    if (i18nType === 'default') {
        for (let l in __KOOT_SSR__.ssrConfig.chunkmap) {
            const thisLocaleId = l.substr(0, 1) === '.' ? l.substr(1) : l
            __KOOT_SSR__.ssrConfig.entrypoints.set(thisLocaleId, __KOOT_SSR__.ssrConfig.chunkmap[l]['.entrypoints'])
            __KOOT_SSR__.ssrConfig.filemap.set(thisLocaleId, __KOOT_SSR__.ssrConfig.chunkmap[l]['.files'])
            __KOOT_SSR__.ssrConfig.templateInjectCache.set(thisLocaleId, {
                pathnameSW: getSWPathname(thisLocaleId)
            })
        }
    } else {
        __KOOT_SSR__.ssrConfig.entrypoints.set('', __KOOT_SSR__.ssrConfig.chunkmap['.entrypoints'])
        __KOOT_SSR__.ssrConfig.filemap.set('', __KOOT_SSR__.ssrConfig.chunkmap['.files'])
        __KOOT_SSR__.ssrConfig.templateInjectCache.set('', {
            pathnameSW: getSWPathname()
        })
    }

    // 标记完成
    __KOOT_SSR__.ssrConfig._init = true

    return __KOOT_SSR__.ssrConfig
}

ssr().catch(err => {
    __KOOT_SSR__.__RESULT__ = {
        error: err
    }
})

export default ssr
