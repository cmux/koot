/* global
    __KOOT_STORE__:false,
    __KOOT_HISTORY__:false,
    __KOOT_LOCALEID__:false,
    __KOOT_SSR__:false
*/

import React from 'react'
import { renderToString } from 'react-dom/server'
import RootIsomorphic from './root-isomorphic'
import match from 'react-router/lib/match'

import * as kootConfig from '__KOOT_PROJECT_CONFIG_FULL_PATHNAME__'

import { publicPathPrefix } from '../../defaults/webpack-dev-server'

import { CHANGE_LANGUAGE } from '../action-types'

import validateRouterConfig from '../../React/validate/router-config'
import validateInject from '../../React/validate-inject'
import isNeedInjectCritical from '../../React/inject/is-need-inject-critical'
import renderTemplate from '../../React/render-template'

import beforeRouterMatch from './middlewares/isomorphic/lifecycle/before-router-match'
import beforeDataToStore from './middlewares/isomorphic/lifecycle/before-data-to-store'
import afterDataToStore from './middlewares/isomorphic/lifecycle/after-data-to-store'
import executeComponentsLifecycle from './middlewares/isomorphic/execute-components-lifecycle'

import i18nOnServerRender from '../../i18n/onServerRender'
import i18nGenerateHtmlRedirectMetas from '../../i18n/server/generate-html-redirect-metas'
import i18nGetSSRState from '../../i18n/server/get-ssr-state'

const ssr = async (options = {}) => {

    const {
        LocaleId = __DEV__ ? global.__KOOT_LOCALEID__ : __KOOT_LOCALEID__,
        Store = __DEV__ ? global.__KOOT_STORE__ : __KOOT_STORE__,
        History = __DEV__ ? global.__KOOT_HISTORY__ : __KOOT_HISTORY__,
        SSR = __DEV__ ? global.__KOOT_SSR__ : __KOOT_SSR__
    } = options

    /** @type {Boolean} i18n 是否启用 */
    const i18nEnabled = Boolean(LocaleId)

    const {
        ctx,
        thisTemplateInjectCache, thisEntrypoints, thisFilemap, //thisStyleMap,
        styleMap,
        template,
        templateInject,
        proxyRequestOrigin,
        syncCookie,
        ssrComplete,
    } = SSR

    /** @type {String} 本次请求的 URL */
    const url = ctx.path + ctx.search

    const {
        lifecycle,
        routerConfig: routes,
    } = await initConfig(i18nEnabled)

    // 渲染生命周期: beforeRouterMatch
    await beforeRouterMatch({
        ctx,
        store: Store,
        syncCookie,
        callback: lifecycle.beforeRouterMatch
    })
    if (LocaleId) {
        Store.dispatch({ type: CHANGE_LANGUAGE, data: LocaleId })
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
        ssrComplete({
            redirect: redirectLocation.pathname + redirectLocation.search
        })
        return
    }

    // 如果没有匹配，终止本中间件流程，执行其他中间件
    // 表示 react 不应处理该请求
    if (!renderProps) {
        ssrComplete({
            next: true
        })
        return
    }

    // 渲染生命周期: beforeDataToStore
    await beforeDataToStore({
        ctx,
        store: Store,
        localeId: LocaleId,
        callback: lifecycle.beforeDataToStore
    })

    // 执行所有匹配到的组件的自定义的静态生命周期
    const {
        title, metaHtml, reduxHtml
    } = await executeComponentsLifecycle({ store: Store, renderProps, ctx })

    // 渲染生命周期: afterDataToStore
    await afterDataToStore({
        ctx,
        store: Store,
        localeId: LocaleId,
        callback: lifecycle.afterDataToStore
    })

    // SSR
    const reactHtml = renderToString(
        <RootIsomorphic
            store={Store}
            {...renderProps}
        />
    )
    // console.log({
    //     // __KOOT_SSR__,
    //     // thisTemplateInjectCache,
    //     // thisEntrypoints, thisFilemap,
    //     thisStyleMap,
    //     // templateInject,
    //     // proxyRequestOrigin,
    // })
    // const stylesHtml = Object.keys(thisStyleMap)
    //     .filter(id => typeof thisStyleMap[id].css === 'string')
    //     .map(id => `<style id="${id}">${thisStyleMap[id].css}</style>`)
    //     .join('')
    const stylesHtml = Object.keys(styleMap)
        .filter(id => typeof styleMap[id].css === 'string')
        .map(id => `<style id="${id}">${styleMap[id].css}</style>`)
        .join('')
    // console.log('result thisStyleMap', thisStyleMap)

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
        SSRState: {
            ...i18nGetSSRState()
        },
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
        delete thisTemplateInjectCache.styles
        delete thisTemplateInjectCache.scriptsInBody
        // delete thisTemplateInjectCache.pathnameSW

        const origin = ctx.origin.split('://')[1]
        // origin = origin.split(':')[0]
        body = body.replace(
            /:\/\/localhost:([0-9]+)/mg,
            `://${origin}/${publicPathPrefix}`
        )
    }

    // React SSR
    ssrComplete({
        body
    })
}

/**
 * 初始化 SSR 配置
 * @param {*} i18nEnabled 
 */
const initConfig = async (i18nEnabled) => {

    const LocaleId = __DEV__ ? global.__KOOT_LOCALEID__ : __KOOT_LOCALEID__

    const {
        server: serverConfig = {},
    } = kootConfig

    const config = {}

    // 决定路由配置 (每次请求需重新生成)
    config.routerConfig = await validateRouterConfig(kootConfig.router)

    if (typeof i18nEnabled === 'undefined')
        i18nEnabled = Boolean(LocaleId)

    config.lifecycle = {}
    if (typeof serverConfig.onRender === 'function') {
        config.lifecycle.beforeDataToStore = serverConfig.onRender
    } else if (typeof serverConfig.onRender === 'object') {
        Object.keys(serverConfig.onRender).forEach(key => {
            config.lifecycle[key] = serverConfig.onRender[key]
        })
    }

    return config
}

if (!__DEV__)
    ssr().catch(err => {
        __KOOT_SSR__.ssrComplete({
            error: err
        })
        console.error(err)
        throw err
    })

export default ssr
