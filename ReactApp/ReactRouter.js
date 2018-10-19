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

        // 2018/10/20 -- start
        // add by mazhenyu(@zrainma@sina.com)
        // 
        // react-router 的根目录 不允许设置为 ''
        // path === '' 会报错 Location "/" did not match any routes
        // 
        // 在 server 端将会导致 asyncReactRouterMatch renderProps 的结果为 undefined
        // 返回结果 not found
        // 且前端无内容，无错误提示
        // 
        // 如果前端传过来的 path === '' 此处会丢失 path 属性
        // 增加判断 router.path === '' || router.path不存在时设置 router.path = '/'
        // 
        // 2018/10/20 -- end
        if (!router.path) {
            router.path = '/'
        }
        this.rootRouter = router
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