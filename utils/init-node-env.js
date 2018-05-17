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
        WEBPACK_ANALYZE: JSON.stringify(false),

        // 仅限 STAGE: client && ENV: dev
        // 客户端开发环境 webpack-dev-server 端口号
        WEBPACK_DEV_SERVER_PORT: 3001,

        // chunkmap
        WEBPACK_CHUNKMAP: '',

        // 打包配置文件路径，默认不存在。如果存在则默认使用
        // WEBPACK_BUILD_CONFIG_PATHNAME: ...,

        // 运行服务器
        // SERVER_DOMAIN: 'localhost', // TODO: remove
        SERVER_PORT: (() => process.env.WEBPACK_BUILD_ENV === 'dev' ? '3000' : '8080')(),

        // 总开关：i18n/多语言相关处理
        SUPER_I18N: JSON.stringify(false),
        // i18n处理方式
        SUPER_I18N_TYPE: '',
        // 语言包
        SUPER_I18N_LOCALES: JSON.stringify([]),
        // 使用的COOKIE KEY
        SUPER_I18N_COOKIE_KEY: 'spLocaleId',
    }
    for (let key in defaults) {
        if (typeof process.env[key] === 'undefined') {
            process.env[key] = defaults[key]
        }
    }
}
