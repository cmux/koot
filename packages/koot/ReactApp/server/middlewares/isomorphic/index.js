import React from 'react'
import { renderToString } from 'react-dom/server'
import match from 'react-router/lib/match'
import useRouterHistory from 'react-router/lib/useRouterHistory'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { syncHistoryWithStore } from 'react-router-redux'

import i18nGetLangFromCtx from '../../../../i18n/server/get-lang-from-ctx'
import isI18nEnabled from '../../../../i18n/is-enabled'

import validateStore from './validate-store'
import beforeRouterMatch from './lifecycle/before-router-match'
import beforeDataToStore from './lifecycle/before-data-to-store'
import afterDataToStore from './lifecycle/after-data-to-store'
import executeComponentsLifecycle from './execute-components-lifecycle'

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

    // console.log(options)

    return async (ctx, next) => {

        /** @type {String} 本次请求的 URL */
        const url = ctx.path + ctx.search

        try {

            /** @type {String} 本次请求的语种ID */
            const localeId = i18nGetLangFromCtx(ctx)

            // TODO: 如果存在缓存匹配，直接返回缓存结果

            /** @type {Object} Redux store */
            const Store = validateStore(reduxConfig)

            // 生成 History
            const historyConfig = { basename: '/' }
            if (isI18nEnabled() &&
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

            // TODO: React SSR
            console.log({
                title, metaHtml, reduxHtml
            })

            // 渲染 EJS 模板

            // TODO: 结果写入缓存

            // 吐出结果

            const reactHtmlString = '1'
            const html = renderToString(
                <div>123</div>
            )

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
