// import RootComponent from './RootComponent'

export default class ReactRouter {

    constructor() {
        // 之前的rootRouter格式
        // this.rootRouter = {
        //     path: '/',
        //     component: RootComponent,
        //     childRoutes: []
        // }
        this.rootRouter = null
    }

    add(router) {

        // 修改用外面传进来的router，并兼任之前的版本
        // 这里的重点区别是react-router和koa-router的根路由path
        // react-router是 '/'
        // koa-router是 ''
        // this.rootRouter.childRoutes.push(router)
        if (router.path === '') {
            router.path = '/'
            this.rootRouter = router
        }
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