import App from '../ui/App.jsx'


// 检查当前URL与路由配置路径是否相匹配，如果否，则不予渲染组件
// 通常在网络连接情况较差的情况下，容易出现不匹配的情况
export const routeCheck = (nextState) => __SERVER__ ? true : (nextState.location.pathname === location.pathname)

export default {
    path: '',
    component: App,
    name: 'page-app',
    childRoutes: [
        {
            path: 'page1', // url: /page1
            name: 'page1', // component name: page1
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    // cb(null, require('UI/pages/Home').default)
                    if (routeCheck(nextState)) cb(null, require('../ui/Page1.jsx').default)
                }, 'page1')  // js file name: page1.js
            },
            isIndex: true
        }
    ]
}