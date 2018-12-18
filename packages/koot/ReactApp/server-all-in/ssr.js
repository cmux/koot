/* global
    Store:true,
    History:true,
    __KOOT_SSR__:false
*/

import React from 'react'
import { renderToString } from 'react-dom/server'
import RootIsomorphic from './root-isomorphic'
import match from 'react-router/lib/match'
import useRouterHistory from 'react-router/lib/useRouterHistory'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { syncHistoryWithStore } from 'react-router-redux'

import * as kootConfig from '__KOOT_PROJECT_CONFIG_PATHNAME__'

import { publicPathPrefix } from '../../defaults/webpack-dev-server'

import getChunkmap from '../../utils/get-chunkmap'
import getSWPathname from '../../utils/get-sw-pathname'
import { CHANGE_LANGUAGE } from '../action-types'

import validateReduxConfig from '../../React/validate/redux-config'
import validateRouterConfig from '../../React/validate/router-config'
import validateInject from '../../React/validate-inject'
import isNeedInjectCritical from '../../React/inject/is-need-inject-critical'
import renderTemplate from '../../React/render-template'

import validateTemplate from './validate/template'
import validateI18n from './validate/i18n'
import validateStore from './middlewares/isomorphic/validate-store'
import createRenderCacheMap from './validate/create-render-cache-map'

import beforeRouterMatch from './middlewares/isomorphic/lifecycle/before-router-match'
import beforeDataToStore from './middlewares/isomorphic/lifecycle/before-data-to-store'
import afterDataToStore from './middlewares/isomorphic/lifecycle/after-data-to-store'
import executeComponentsLifecycle from './middlewares/isomorphic/execute-components-lifecycle'

import isI18nEnabled from '../../i18n/is-enabled'
import i18nOnServerRender from '../../i18n/onServerRender'
import i18nGetLangFromCtx from '../../i18n/server/get-lang-from-ctx'
import i18nGenerateHtmlRedirectMetas from '../../i18n/server/generate-html-redirect-metas'

const ssr = async () => {

    const { ctx } = __KOOT_SSR__

    /** @type {String} 本次请求的 URL */
    const url = ctx.path + ctx.search

    /** @type {Boolean} i18n 是否启用 */
    const i18nEnabled = isI18nEnabled()

    console.log('global.kootSSR', global.kootSSR)

    // 处理配置
    if (typeof global.kootSSR === 'undefined') {
        global.kootSSR = {}

        const {
            server: serverConfig = {},
        } = kootConfig
        const {
            renderCache: renderCacheConfig = {},
            inject: templateInject,
            proxyRequestOrigin = {},
        } = serverConfig
        global.kootSSR.lifecycle = {}
        if (typeof serverConfig.onRender === 'function') {
            global.kootSSR.lifecycle.afterDataToStore = serverConfig.onRender
        } else if (typeof serverConfig.onRender === 'object') {
            Object.keys(serverConfig.onRender).forEach(key => {
                global.kootSSR.lifecycle[key] = serverConfig.onRender[key]
            })
        }

        // 决定模板内容 (String)
        global.kootSSR.template = await validateTemplate(kootConfig.template)

        // 决定 Redux 配置
        global.kootSSR.reduxConfig = await validateReduxConfig(kootConfig.redux)

        // 决定路由配置
        global.kootSSR.routerConfig = await validateRouterConfig(kootConfig.router)

        // 语言包写入内存
        await validateI18n()

        // 创建渲染缓存 Map
        global.kootSSR.renderCacheMap = await createRenderCacheMap(renderCacheConfig)

        // 其他选项
        global.kootSSR.templateInject = templateInject
        global.kootSSR.proxyRequestOrigin = proxyRequestOrigin

        /**
         * @type {Map}
         * 注入内容缓存
         * 则第一级为语种ID或 `` (空字符串)
         */
        global.kootSSR.templateInjectCache = new Map()

        /** @type {Object} chunkmap */
        global.kootSSR.chunkmap = getChunkmap(true)
        /** @type {Map} webpack 的入口，从 chunkmap 中抽取 */
        global.kootSSR.entrypoints = new Map()
        /** @type {Map} 文件名与实际结果的文件名的对应表，从 chunkmap 中抽取 */
        global.kootSSR.filemap = new Map()

        /** @type {String} i18n 类型 */
        const i18nType = i18nEnabled
            ? JSON.parse(process.env.KOOT_I18N_TYPE)
            : undefined
        /** @type {Boolean} i18n 类型是否是默认 (分包) 形式 */
        const i18nTypeIsDefault = (i18nType === 'default')

        // 针对 i18n 分包形式的项目，静态注入按语言缓存
        if (i18nTypeIsDefault) {
            for (let l in global.kootSSR.chunkmap) {
                const thisLocaleId = l.substr(0, 1) === '.' ? l.substr(1) : l
                global.kootSSR.entrypoints.set(thisLocaleId, global.kootSSR.chunkmap[l]['.entrypoints'])
                global.kootSSR.filemap.set(thisLocaleId, global.kootSSR.chunkmap[l]['.files'])
                global.kootSSR.templateInjectCache.set(thisLocaleId, {
                    pathnameSW: getSWPathname(thisLocaleId)
                })
            }
        } else {
            global.kootSSR.entrypoints.set('', global.kootSSR.chunkmap['.entrypoints'])
            global.kootSSR.filemap.set('', global.kootSSR.chunkmap['.files'])
            global.kootSSR.templateInjectCache.set('', {
                pathnameSW: getSWPathname()
            })
        }
    }

    const {
        lifecycle,
        templateInject,
        proxyRequestOrigin,

        template,
        reduxConfig,
        routerConfig: routes,
        renderCacheMap,

        templateInjectCache,
        entrypoints,
        filemap,
    } = global.kootSSR

    /** @type {String} 本次请求的语种ID */
    const localeId = i18nGetLangFromCtx(ctx) || ''

    // 如果存在缓存匹配，直接返回缓存结果
    const thisRenderCache = renderCacheMap.get(localeId)
    const cached = thisRenderCache.get(url)
    if (!__DEV__ && cached !== false) {
        ctx.body = cached
        __KOOT_SSR__.__RESULT__ = {
            body: cached
        }
        return
    }

    /** @type {Object} 本次请求的 (当前语言的) 注入内容缓存 */
    const thisTemplateInjectCache = templateInjectCache.get(localeId)
    /** @type {Object} 本次请求的 (当前语言的) 入口表 */
    const thisEntrypoints = entrypoints.get(localeId)
    /** @type {Object} 本次请求的 (当前语言的) 文件名对应表 */
    const thisFilemap = filemap.get(localeId)

    /** @type {Object} Redux store */
    Store = validateStore(reduxConfig)

    // 生成 History
    const historyConfig = { basename: '/' }
    if (i18nEnabled &&
        process.env.KOOT_I18N_URL_USE === 'router' &&
        localeId
    ) {
        historyConfig.basename = `/${localeId}`
    }
    const memoryHistory = useRouterHistory(() => createMemoryHistory(url))(historyConfig)
    /** @type {Object} 已生成的 History 实例 */
    History = syncHistoryWithStore(memoryHistory, Store)

    // 渲染生命周期: beforeRouterMatch
    await beforeRouterMatch({
        store: Store,
        ctx,
        syncCookie: reduxConfig.syncCookie,
        callback: lifecycle.beforeRouterMatch
    })
    if (localeId) {
        if (__DEV__) await validateI18n()
        Store.dispatch({ type: CHANGE_LANGUAGE, data: localeId })
        i18nOnServerRender({ store: Store })
    }

    // 进行路由匹配
    const {
        redirectLocation, renderProps
    } = await new Promise((resolve, reject) => {
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
        // return ctx.redirect(redirectLocation.pathname + redirectLocation.search)
        return
    }

    // 如果没有匹配，终止本中间件流程，执行其他中间件
    // 表示 react 不应处理该请求
    if (!renderProps) {
        __KOOT_SSR__.__RESULT__ = {
            next: true
        }
        // return await next()
        return
    }

    // 渲染生命周期: beforeDataToStore
    await beforeDataToStore({
        store: Store,
        ctx,
        localeId,
        callback: lifecycle.beforeDataToStore
    })

    // 执行所有匹配到的组件的自定义的静态生命周期
    const {
        title, metaHtml, reduxHtml
    } = await executeComponentsLifecycle({ store: Store, renderProps, ctx })
    console.log({ title, metaHtml, reduxHtml })

    // 渲染生命周期: afterDataToStore
    await afterDataToStore({
        store: Store,
        ctx,
        callback: lifecycle.afterDataToStore
    })

    // SSR
    const html = renderToString(
        <RootIsomorphic
            store={Store}
            {...renderProps}
        />
    )

    // 渲染 EJS 模板
    const inject = validateInject({
        injectCache: thisTemplateInjectCache,
        filemap: thisFilemap,
        entrypoints: thisEntrypoints,
        localeId,
        title,
        metaHtml,
        reactHtml: html,
        stylesHtml: '',
        reduxHtml,
        needInjectCritical: isNeedInjectCritical(template),
    })
    // i18n 启用时: 添加其他语种页面跳转信息的 meta 标签
    if (localeId) {
        inject.metas += i18nGenerateHtmlRedirectMetas({
            ctx, proxyRequestOrigin, localeId
        })
    }
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
    } else {
        // HTML 结果暂存入缓存
        thisRenderCache.set(url, body)
    }

    // React SSR
    __KOOT_SSR__.__RESULT__ = {
        body
    }
}

ssr().catch(err => {
    __KOOT_SSR__.__RESULT__ = {
        error: err
    }
})

export default ssr
