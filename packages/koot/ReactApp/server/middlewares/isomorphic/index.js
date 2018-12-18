import match from 'react-router/lib/match'
import useRouterHistory from 'react-router/lib/useRouterHistory'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { syncHistoryWithStore } from 'react-router-redux'

import { CHANGE_LANGUAGE } from '../../../action-types'
import { publicPathPrefix } from '../../../../defaults/webpack-dev-server'

import getChunkmap from '../../../../utils/get-chunkmap'
import getSWPathname from '../../../../utils/get-sw-pathname'

import i18nGetLangFromCtx from '../../../../i18n/server/get-lang-from-ctx'
import isI18nEnabled from '../../../../i18n/is-enabled'
import i18nGenerateHtmlRedirectMetas from '../../../../i18n/server/generate-html-redirect-metas'
import i18nOnServerRender from '../../../../i18n/onServerRender'

import { parseHtmlForStyles } from '../../../../React/styles'
import validateInject from '../../../../React/validate-inject'
import isNeedInjectCritical from '../../../../React/inject/is-need-inject-critical'
import renderTemplate from '../../../../React/render-template'

import validateStore from './validate-store'
import validateI18n from '../../validate/i18n'
import beforeRouterMatch from './lifecycle/before-router-match'
import beforeDataToStore from './lifecycle/before-data-to-store'
import afterDataToStore from './lifecycle/after-data-to-store'
import executeComponentsLifecycle from './execute-components-lifecycle'
import ssr from './ssr'

/**
 * KOA 中间件: 同构
 * @param {Object} options
 * @param {String} options.template EJS 模板内容
 * @param {Object} options.templateInject 模板注入方法合集对象
 * @param {Object} options.reduxConfig Redux 配置
 * @param {Function} [options.reduxConfig.factoryStore] 生成 Redux Store 的方法。`factoryStore` 和 `store` 必须存在一个，且互斥
 * @param {Object} [options.reduxConfig.store] Redux Store 对象。`factoryStore` 和 `store` 必须存在一个，且互斥
 * @param {Object} [options.reduxConfig.syncCookie] 同步 cookie 到 store 的配置
 * @param {Object} options.routerConfig 路由配置对象，直接供 `react-router` 使用
 * @param {Map} options.renderCacheMap 渲染结果缓存存储空间
 * @param {Object} [options.proxyRequestOrigin] 代理请求配置对象
 * @param {Function} [options.beforeRouterMatch] 生命周期: 在进行路由匹配之前
 * @param {Function} [options.beforeDataToStore] 生命周期: 在数据同步至 store 之前
 * @param {Function} [options.afterDataToStore] 生命周期: 在数据同步至 store 之后
 * @returns {Function} KOA middleware
 */
const middlewareIsomorphic = (options = {}) => {

    const {
        template,
        reduxConfig = {},
        routerConfig: routes,
        renderCacheMap,
        templateInject,
        proxyRequestOrigin = {},

        beforeRouterMatch: renderBeforeRouterMatch,
        beforeDataToStore: renderBeforeDataToStore,
        afterDataToStore: renderAfterDataToStore
    } = options

    /**
     * @type {Map}
     * 注入内容缓存
     * 则第一级为语种ID或 `` (空字符串)
     */
    const templateInjectCache = new Map()

    /** @type {Object} chunkmap */
    const chunkmap = getChunkmap(true)
    /** @type {Map} webpack 的入口，从 chunkmap 中抽取 */
    const entrypoints = new Map()
    /** @type {Map} 文件名与实际结果的文件名的对应表，从 chunkmap 中抽取 */
    const filemap = new Map()

    /** @type {Boolean} i18n 是否启用 */
    const i18nEnabled = isI18nEnabled()
    /** @type {String} i18n 类型 */
    const i18nType = i18nEnabled
        ? JSON.parse(process.env.KOOT_I18N_TYPE)
        : undefined
    /** @type {Boolean} i18n 类型是否是默认 (分包) 形式 */
    const i18nTypeIsDefault = (i18nType === 'default')

    // 针对 i18n 分包形式的项目，静态注入按语言缓存
    if (i18nTypeIsDefault) {
        for (let l in chunkmap) {
            const thisLocaleId = l.substr(0, 1) === '.' ? l.substr(1) : l
            entrypoints.set(thisLocaleId, chunkmap[l]['.entrypoints'])
            filemap.set(thisLocaleId, chunkmap[l]['.files'])
            templateInjectCache.set(thisLocaleId, {
                pathnameSW: getSWPathname(thisLocaleId)
            })
        }
    } else {
        entrypoints.set('', chunkmap['.entrypoints'])
        filemap.set('', chunkmap['.files'])
        templateInjectCache.set('', {
            pathnameSW: getSWPathname()
        })
    }

    return async (ctx, next) => {

        /** @type {String} 本次请求的 URL */
        const url = ctx.path + ctx.search

        try {

            /** @type {String} 本次请求的语种ID */
            const localeId = i18nGetLangFromCtx(ctx) || ''

            // 如果存在缓存匹配，直接返回缓存结果
            const thisRenderCache = renderCacheMap.get(localeId)
            const cached = thisRenderCache.get(url)
            if (!__DEV__ && cached !== false) {
                ctx.body = cached
                return
            }

            /** @type {Object} 本次请求的 (当前语言的) 注入内容缓存 */
            const thisTemplateInjectCache = templateInjectCache.get(localeId)
            /** @type {Object} 本次请求的 (当前语言的) 入口表 */
            const thisEntrypoints = entrypoints.get(localeId)
            /** @type {Object} 本次请求的 (当前语言的) 文件名对应表 */
            const thisFilemap = filemap.get(localeId)

            /** @type {Object} Redux store */
            const Store = validateStore(reduxConfig)

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
            const History = syncHistoryWithStore(memoryHistory, Store)

            // 渲染生命周期: beforeRouterMatch
            await beforeRouterMatch({
                store: Store,
                ctx,
                localeId,
                syncCookie: reduxConfig.syncCookie,
                callback: renderBeforeRouterMatch
            })

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
            if (redirectLocation)
                return ctx.redirect(redirectLocation.pathname + redirectLocation.search)

            // 如果没有匹配，终止本中间件流程，执行其他中间件
            // 表示 react 不应处理该请求
            if (!renderProps)
                return await next()

            // 渲染生命周期: beforeDataToStore
            await beforeDataToStore({
                store: Store,
                ctx,
                localeId,
                callback: renderBeforeDataToStore
            })

            // 执行所有匹配到的组件的自定义的静态生命周期
            const {
                title, metaHtml, reduxHtml
            } = await executeComponentsLifecycle({ store: Store, renderProps, ctx })

            // 渲染生命周期: afterDataToStore
            await afterDataToStore({
                store: Store,
                ctx,
                callback: renderAfterDataToStore
            })
            if (localeId) {
                if (__DEV__) await validateI18n()
                Store.dispatch({ type: CHANGE_LANGUAGE, data: localeId })
                i18nOnServerRender({ store: Store })
            }

            // React SSR
            const ssrHtml = ssr({
                Store,
                History,
                renderProps
            })
            const {
                html: reactHtml,
                htmlStyles: stylesHtml
            } = parseHtmlForStyles(ssrHtml)
            console.log({
                ssrHtml,
                reactHtml,
                stylesHtml,
            })

            // 渲染 EJS 模板
            const inject = validateInject({
                injectCache: thisTemplateInjectCache,
                filemap: thisFilemap,
                entrypoints: thisEntrypoints,
                localeId,
                title,
                metaHtml,
                reactHtml,
                stylesHtml,
                reduxHtml,
                needInjectCritical: isNeedInjectCritical(template),
            })
            // i18n 启用时: 添加其他语种页面跳转信息的 meta 标签
            if (i18nEnabled) {
                inject.metas += i18nGenerateHtmlRedirectMetas({
                    ctx, proxyRequestOrigin, localeId
                })
            }
            let html = renderTemplate({
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
                html = html.replace(
                    /:\/\/localhost:([0-9]+)/mg,
                    `://${origin}/${publicPathPrefix}`
                )
            } else {
                // HTML 结果暂存入缓存
                thisRenderCache.set(url, html)
            }

            // 吐出结果
            ctx.body = html

        } catch (err) {

            require('debug')('SYSTEM:isomorphic:error')('Server-Render Error Occures: %O', err.stack)
            ctx.status = 500
            ctx.body = err.message
            ctx.app.emit('error', err, ctx)

        }
    }
}

export default middlewareIsomorphic
