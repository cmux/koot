import { createReactRouterConfiguration } from 'koot-router'
import routeCheck from 'koot/React/route-check'

/**
 * 检查下一个路由是否需要验证登陆状态，
 * 如果需要验证，则验证，
 * 如果不需要，则直接通过
 * 如果需要验证且验证不通过，则跳转至登陆页面
 * 
 * @param {*} nextState 
 * @param {*} replace 
 * @param {Function} callback 
 */
const authFilter = (nextState, replace, callback) => {
    //... 鉴权过程
    callback()
}

/**
 * @type {Object} 路由配置对象
 * 推荐: 使用 koot-router 提供的方法封装路由配置对象
 */
const routes = createReactRouterConfiguration({

    path: '/',
    component: require('@views/app').default, // 项目的根层组件

    onEnter: authFilter,

    indexRoute: {
        // 标准: 打包后，该组件会存在于核心包中
        // 推荐: 小型项目或大型项目的小型页面使用
        // component: require('@views/home').default

        // 自动分包 / 代码分割: 打包后，该组件会存在于独立的 .js 文件中
        // 推荐: 大型项目使用
        // 推荐: 使用 koot 提供的 routeCheck 方法保证路由组件的正确渲染 (详情请查阅文档)
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
})

export default routes
