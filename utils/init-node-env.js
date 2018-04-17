module.exports = () => {
    const defaults = {
        // 描述环境
        // dev 开发 | dist 部署
        WEBPACK_BUILD_ENV: 'dev',

        // 描述场景
        // client 客户端 | server 服务端
        WEBPACK_STAGE_MODE: 'client',

        // 客户端开发环境webpack-dev-server端口号
        WEBPACK_DEV_SERVER_PORT: 3001,

        // Webpack 打包结果分析
        WEBPACK_ANALYZE: false,

        // 运行服务器
        SERVER_DOMAIN: 'localhost',
        SERVER_PORT: (() => process.env.WEBPACK_BUILD_ENV === 'dev' ? '3000' : '8080')()
    }
    for (let key in defaults) {
        if (typeof process.env[key] === 'undefined') {
            process.env[key] = defaults[key]
        }
    }
}
