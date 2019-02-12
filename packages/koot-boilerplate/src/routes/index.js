import routeCheck from 'koot/React/route-check'

/**
 * @type {Object} 路由配置对象
 * 原则上支持任何与 `react-router` (v3) 兼容的对象
 * - 可使用 koot-router 提供的方法封装路由配置对象
 */
export default {

    path: '/',
    component: require('@components/app').default, // 项目的根层组件

    indexRoute: {
        // 标准: 打包后，该组件会存在于核心包中
        // 推荐: 小型项目或大型项目的小型页面使用
        // component: require('@views/home').default

        // 自动分包 / 代码分割: 打包后，该组件会存在于独立的 .js 文件中
        // 推荐: 大型项目使用
        // 推荐: 使用 koot 提供的 routeCheck 方法保证路由组件的正确渲染 (详情请查阅文档)
        getComponent: (nextState, cb) => {
            require.ensure([], (require) => {
                if (routeCheck(nextState)) cb(null, require('@views/home').default)
            }, 'Page-Home')
        }
    },

    childRoutes: [
        {
            path: 'static',
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    if (routeCheck(nextState)) cb(null, require('@views/static').default)
                }, 'Page-Static')
            }
        },
    ]
}
