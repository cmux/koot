


// import { parseHtmlForStyles } from '../../React/styles'

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
const middlewareIsomorphic = () => {

    return async (ctx, next) => {
        try {

            // eval SSR
            const result = await ssr({ ctx })

            if (result.body) {
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
