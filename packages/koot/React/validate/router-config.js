import errorMsg from '../../libs/error-msg'
import i18nValidateRoutes from '../../i18n/validte-routes'

/**
 * 验证 `react-router` 配置
 * 
 * @async
 * @param {Object} kootConfigRouter Koot 配置项: `router`
 * @returns {Object} routerConfig
 */
export default async (kootConfigRouter) => {

    if (typeof kootConfigRouter !== 'object')
        throw new Error(errorMsg('VALIDATE_ROUTER_CONFIG', 'no router config or router object invalid'))

    const { ...routes } = (() => {
        if (Array.isArray(kootConfigRouter)) {
            return {
                childRoutes: [...kootConfigRouter]
            }
        }
        return kootConfigRouter
    })()

    if (!routes.path) {
        routes.path = '/'
    }

    handleIndexRoute(routes)

    return i18nValidateRoutes(routes)

}

/**
 * 处理默认路由
 * @param {any} route
 */
const handleIndexRoute = (route) => {
    if (route && (!route.childRoutes || !route.childRoutes.length)) {
        return
    }

    route.childRoutes = route.childRoutes.filter(child => { // eslint-disable-line
        if (child.isIndex) {

            /* istanbul ignore next */
            if (process.env.NODE_ENV === 'dev' && route.indexRoute) {
                console.error('More than one index route: ', route)
            }

            /* istanbul ignore else */
            if (!route.indexRoute) {
                delete child.path; // eslint-disable-line
                route.indexRoute = child; // eslint-disable-line
                return false
            }
        }
        return true
    })

    route.childRoutes.forEach(handleIndexRoute)
}
