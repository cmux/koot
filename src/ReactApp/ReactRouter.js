import RootComponent from './RootComponent'

export default class ReactRouter {

    constructor() {
        this.rootRouter = {
            path: '/',
            component: RootComponent,
            childRoutes: []
        }
    }

    add(router) {
        this.rootRouter.childRoutes.push(router)
    }

    get() {
        let routes = [this.rootRouter]
        routes.forEach(handleIndexRoute)
        return routes
    }

}



/**
 * 处理默认路由
 *
 * @param {any} route
 */
function handleIndexRoute(route) {
    if (!route.childRoutes || !route.childRoutes.length) {
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