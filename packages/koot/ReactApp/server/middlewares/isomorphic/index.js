import useRouterHistory from 'react-router/lib/useRouterHistory'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { syncHistoryWithStore } from 'react-router-redux'

import i18nGetLangFromCtx from '../../../../i18n/server/get-lang-from-ctx'

import validateStore from './validate-store'
import ssr from './ssr'


/**
 * KOA 中间件: 同构
 * @param {Object} options
 * @param {Object} options.reduxConfig Redux 配置
 * @param {Function} [options.reduxConfig.factoryStore] 生成 Redux Store 的方法。`factoryStore` 和 `store` 必须存在一个，且互斥
 * @param {Object} [options.reduxConfig.store] Redux Store 对象。`factoryStore` 和 `store` 必须存在一个，且互斥
 * @param {Object} [options.reduxConfig.syncCookie] 同步 cookie 到 store 的配置
 * @param {Object} options.routerConfig 路由配置对象，直接供 `react-router` 使用
 * @returns {Function} KOA middleware
 */
const middlewareIsomorphic = (options = {}) => {

    const {
        reduxConfig,
        renderCacheMap
    } = options
    const ssrConfig = {}

    // const localeIds = getLocaleIds()
    // const styleMap = new Map()
    // if (localeIds.length) {
    //     localeIds.forEach(localeId => {
    //         styleMap.set(localeId, {})
    //     })
    // } else {
    //     styleMap.set('', {})
    // }
    const styleMap = {}

    return async (ctx, next) => {

        /** @type {String} 本次请求的 URL */
        const url = ctx.path + ctx.search

        try {

            // console.log('request url', url)
            // console.log('\nSSR middleware start')

            /** @type {String} 本次请求的语种ID */
            const LocaleId = i18nGetLangFromCtx(ctx) || ''
            // setLocaleId(LocaleId)
            // console.log(`LocaleId -> ${LocaleId}`)

            // 如果存在缓存匹配，直接返回缓存结果
            const thisRenderCache = renderCacheMap.get(LocaleId)
            const cached = thisRenderCache.get(url)
            if (!__DEV__ && cached !== false) {
                ctx.body = cached
                return
            }

            // 生成/清理 Store
            // console.log('\x1b[36m⚑\x1b[0m' + ' Store created')
            const Store = validateStore(reduxConfig)

            // 生成 History
            const historyConfig = {
                basename: LocaleId && process.env.KOOT_I18N_URL_USE === 'router'
                    ? `/${LocaleId}`
                    : '/'
            }
            const memoryHistory = useRouterHistory(() => createMemoryHistory(url))(historyConfig)
            /** @type {Object} 已生成的 History 实例 */
            const History = syncHistoryWithStore(memoryHistory, Store)

            // eval SSR
            const result = await ssr({
                ctx,

                Store, History, LocaleId,

                ssrConfig, styleMap, renderCacheMap,
                syncCookie: reduxConfig.syncCookie
            })

            // console.log('eval finished', {
            //     'localeId in store': Store.getState().localeId
            // })
            // console.log('\n\n\n')

            if (result.body) {
                // HTML 结果暂存入缓存
                thisRenderCache.set(url, result.body)
                ctx.body = result.body
                return
            }

            if (result.error)
                throw result.error

            if (result.redirect)
                return ctx.redirect(result.redirect)

            if (result.next)
                return await next()

        } catch (err) {

            require('debug')('SYSTEM:isomorphic:error')('Server-Render Error Occures: %O', err.stack)
            ctx.status = 500
            ctx.body = err.message
            ctx.app.emit('error', err, ctx)

        }
    }
}

export default middlewareIsomorphic
