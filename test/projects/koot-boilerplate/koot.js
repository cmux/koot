/**
 * 有关项目启动的相关配置
 * 本文件的代码会被 webpack 打包
 * 
 * 可以加载 ES6 module
 * 可以使用构建配置中 defines (webpack.definePlugin) 中定义的变量
 * 
 * @module koot
 */

/** 
 * 项目标识名
 * @type {string}
 */
export const name = 'Koot Boilerplate'

/** 
 * 项目类型
 * 目前支持 'react'
 * 计划支持 'react-config' 'vue'
 * @type {string}
 */
export const type = 'react'

/** 
 * HTML基础模板文件路径
 * @type {string}
 */
export const template = './src/app/template.ejs'

/** 
 * 路由配置 (同构时必须指定)
 * @type {Object}
 */
export const router = require('./src/app/router').default

/** 
 * Redux配置 (同构时必须指定) 
 * @type {Object}
 * @namespace
 * @property {Object} combineReducers - 附加 reducer，与 combineReducers 参数语法相同
 */
export const redux = {
    combineReducers: require('./src/app/redux/reducers').default
}

/** 
 * 客户端配置或启动代码
 * @type {(Object|Function)}
 * @namespace
 * @property {string} [history=(browser|hash)] - 路由历史类型，支持 'browser' 'hash' 'memory' (同构时默认为 'browser'，其他情况默认为 'hash')
 * @property {Function} [before] - 回调：启动前
 * @property {Function} [after] - 回调：启动完成
 * @property {Function} [onRouterUpdate] - 回调：在路由发生改变时
 * @property {Function} [onHistoryUpdate] - 回调：在浏览器历史发生改变时时
 */
// export const client = require('/src/app1/client'), // 替代默认的客户端启动流程
export const client = { // 扩展默认的启动流程
    history: 'browser',
    before: require('./src/app/lifecycle/before').default,
    after: require('./src/app/lifecycle/after').default,
    onRouterUpdate: require('./src/app/lifecycle/on-router-update').default,
    onHistoryUpdate: require('./src/app/lifecycle/on-history-update').default,
}

/** 
 * 服务器端配置或启动代码
 * @type {(Object|Function)}
 * @namespace
 * @property {Object} [koaStatic] - KOA 静态资源服务器扩展配置
 * @property {Object} [reducers] - 服务器专用的附加 Reducer，与 combineReducers 参数语法相同
 * @property {Function} [inject] - 注入内容
 * @property {Function} [before] - 回调：启动前
 * @property {Function} [after] - 回调：启动完成
 * @property {Function} [onRender] - 回调：在渲染时
 */
// export const server = require('/src/app1/server'), // 替代默认的服务器端启动流程
export const server = __SERVER__ ? { // 扩展默认的启动流程
    koaStatic: {
        maxage: 0,
        hidden: true,
        index: 'index.html',
        defer: false,
        gzip: true,
        extensions: false
    },
    // reducers: {},
    inject: require('./src/server/inject').default,
    before: require('./src/server/lifecycle/before').default,
    after: require('./src/server/lifecycle/after').default,
    onRender: require('./src/server/lifecycle/on-render').default,
} : {}
