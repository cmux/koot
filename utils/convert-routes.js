const AsyncComponent = require('../React/AsyncComponent')

/**
 * 兼容性处理：转换 routes 配置
 * @param {Object} routes 路由配置
 * @returns {Object} react-router v4 需要的配置
 */
module.exports = (routes) => convertRoute(routes)

const convertRoute = (route) => {
    if (typeof route !== 'object') return route
    if (Array.isArray(route.childRoutes)) {
        route.routes = route.childRoutes
        delete route.childRoutes
    }
    if (typeof route.indexRoute === 'object') {
        if (!Array.isArray(route.routes))
            route.routes = []
        route.routes.unshift({
            path: '/',
            exact: true,
            ...route.indexRoute
        })
        delete route.indexRoute
    }
    // if (typeof route.getComponent === 'function') {
    //     const matches = /require\(['"](.+?)['"]\).default/.exec()
    //     delete route.getComponent
    // }
    if (typeof route.getComponent === 'function') {
        route.component = AsyncComponent(() =>
            route.getComponent.then(module => module.default)
        )
        delete route.getComponent
    }

    if (Array.isArray(route.routes)) {
        route.routes = route.routes.map(route => convertRoute(route))
    }

    return route
}
