import RootComponent from './RootComponent'

export default class ReactRouter {

    constructor() {
        this.rootReducer = {
            path: '/',
            component: RootComponent,
            childRoutes: []
        }
    }

    add(router) {
        this.rootRouter.childRoutes.push(router)
    }

    get() {
        return [this.rootRouter].forEach(this.__handleIndexRoute)
    }

    __handleIndexRoute(route) {
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

        let me = this
        route.childRoutes.forEach(me.__handleIndexRoute)
    }

}