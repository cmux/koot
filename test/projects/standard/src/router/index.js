// console.log('router/index.js', {
//     'in __KOOT_SSR__': __KOOT_SSR__.LocaleId
// });

import routeCheck from 'koot/React/route-check'
import Root from '@components/app'

// console.log((typeof Store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' Store in [routes]')

export default {

    component: Root,
    name: 'app-root',

    indexRoute: {
        getComponent: (nextState, cb) => {
            require.ensure([], (require) => {
                if (routeCheck(nextState)) cb(null, require('@views/home').default)
            }, 'Page: Home')
        }
    },

    childRoutes: (() => {
        const children = [{
            path: 'static',
            name: 'Page: Static Assets',
            // component: require('@views/static').default,
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    if (routeCheck(nextState)) cb(null, require('@views/static').default)
                }, 'Page: Static Assets')
            }
        }]
        if (!__SPA__) {
            children.push({
                path: 'extend',
                name: 'Page: Component Extender',
                // component: require('@views/extend').default,
                getComponent: (nextState, cb) => {
                    require.ensure([], (require) => {
                        if (routeCheck(nextState)) cb(null, require('@views/extend').default)
                    }, 'Page: Component Extender')
                }
            })
        }
        return children
    })()

}
