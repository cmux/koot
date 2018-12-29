import routeCheck from 'koot/React/route-check'

import AppView from '@views/app'

/**
 * 检查下一个路由是否需要验证登陆状态，
 * 如果需要验证，则验证，
 * 如果不需要，则直接通过
 * 如果需要验证且验证不通过，则跳转至登陆页面
 * 
 * @param {*} nextState 
 * @param {*} replace 
 * @param {*} callback 
 */
const authFilter = (nextState, replace, callback) => {
    //... 鉴权过程
    callback();
}

export default {
    path: '/',
    component: AppView,
    onEnter: authFilter,

    indexRoute: {
        component: (nextState, cb) => {
            require.ensure([], (require) => {
                if (routeCheck(nextState)) cb(null, require('@views/home').default)
            }, 'Page: Home')
        }
    },

    children: [
        {
            path: 'static',
            component: (nextState, cb) => {
                require.ensure([], (require) => {
                    if (routeCheck(nextState)) cb(null, require('@views/static').default)
                }, 'Page: static')
            }
        },
    ]
}
