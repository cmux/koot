import routeCheck from 'koot/React/route-check'
import Root from '@ui/app'

export default {
    // path: __SPA__ ? '/' : '',
    component: Root,
    name: 'app-root',

    indexRoute: {
        getComponent: (nextState, cb) => {
            require.ensure([], (require) => {
                if (routeCheck(nextState)) cb(null, require('@ui/pages/home').default)
            }, '首页')
        }
    },

    childRoutes: [
        {
            path: 'data',
            name: '同构数据',
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    if (routeCheck(nextState)) cb(null, require('@ui/pages/data').default)
                }, '同构数据')
            }
        },
        {
            path: 'dev',
            name: '开发',
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    if (routeCheck(nextState)) cb(null, require('@ui/pages/dev').default)
                }, '开发')
            }
        },
    ]
}
