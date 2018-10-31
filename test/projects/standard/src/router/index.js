import routeCheck from 'koot/React/route-check'
import Root from '@components/app'

export default {

    component: Root,
    name: 'app-root',

    indexRoute: {
        getComponent: (nextState, cb) => {
            require.ensure([], (require) => {
                if (routeCheck(nextState)) cb(null, require('@views/home1').default)
            }, 'Page: Home')
        }
    },

    childRoutes: [
        {
            path: 'extend',
            name: 'Page: Component Extender',
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    if (routeCheck(nextState)) cb(null, require('@views/extend').default)
                }, 'Page: Component Extender')
            }
        },
        {
            path: 'static',
            name: 'Page: Static Assets',
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    if (routeCheck(nextState)) cb(null, require('@views/static').default)
                }, 'Page: Static Assets')
            }
        },
    ]

}
