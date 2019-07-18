import routeCheck from 'koot/React/route-check';
import App from '@views/app';

/**
 * @type {Object} 路由配置对象
 * 原则上支持任何与 `react-router` (v3) 兼容的对象
 * - 可使用 koot-router 提供的方法封装路由配置对象
 */
export default {
    path: '/',
    component: App, // 项目的根层组件

    indexRoute: {
        /**
         * 标准写法: 打包后，该组件会存在于核心包中
         * - 推荐小型项目或大型项目的小型页面使用
         */
        // component: require('@views/home').default

        /**
         * 代码分割写法: 打包后，该组件会存在于独立的 .js 文件中
         * - 推荐大型项目使用
         * - 推荐使用 koot 提供的 `routeCheck()` 方法保证路由组件的正确渲染 (详情请查阅文档)
         */
        getComponent: (nextState, cb) => {
            import(
                /* webpackChunkName: "PageHome" */
                '@views/home'
            ).then(module => {
                if (routeCheck(nextState)) cb(null, module.default);
            });
        }
    },

    childRoutes: [
        {
            path: 'start',
            getComponent: (nextState, cb) => {
                import(
                    /* webpackChunkName: "PageStart" */
                    '@views/start'
                ).then(module => {
                    if (routeCheck(nextState)) cb(null, module.default);
                });
            }
        },
        {
            path: 'ts',
            getComponent: (nextState, cb) => {
                import(
                    /* webpackChunkName: "PageTS" */
                    '@views/ts-example'
                ).then(module => {
                    if (routeCheck(nextState)) cb(null, module.default);
                });
            }
        }
    ]
};
