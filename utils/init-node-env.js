module.exports = () => {
    const defaults = {
        // Webpack 打包项目模式
        // isomorphic 同构 | spa 单页面应用 | static 静态站点
        WEBPACK_BUILD_TYPE: 'isomorphic',

        // Webpack 打包场景
        // client 客户端 | server 服务端
        WEBPACK_BUILD_STAGE: 'client',

        // Webpack 打包环境
        // dev 开发 | prod 生产
        WEBPACK_BUILD_ENV: 'dev',

        // Webpack 打包结果分析
        WEBPACK_ANALYZE: false,

        // 仅限 STAGE: client && ENV: dev
        // 客户端开发环境 webpack-dev-server 端口号
        WEBPACK_DEV_SERVER_PORT: 3001,

        // 运行服务器
        // SERVER_DOMAIN: 'localhost', // TODO: remove
        SERVER_PORT: (() => process.env.WEBPACK_BUILD_ENV === 'dev' ? '3000' : '8080')()
    }
    for (let key in defaults) {
        if (typeof process.env[key] === 'undefined') {
            process.env[key] = defaults[key]
        }
    }
}
