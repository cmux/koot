const defaultsPWA = require('../defaults/pwa')

/**
 * 初始化 node.js 环境变量
 */
module.exports = () => {
    const defaults = {
        // Webpack 打包项目模式
        // isomorphic 同构 | spa 单页面应用 | static 静态站点
        // 默认情况下，会在 Webpack 打包执行前根据项目配置自动决定，无需修改
        WEBPACK_BUILD_TYPE: 'isomorphic',

        // Webpack 打包场景
        // client 客户端 | server 服务端
        WEBPACK_BUILD_STAGE: 'client',

        // Webpack 打包环境
        // dev 开发 | prod 生产
        WEBPACK_BUILD_ENV: 'dev',

        // Webpack 打包结果分析
        WEBPACK_ANALYZE: JSON.stringify(false),

        // chunkmap
        WEBPACK_CHUNKMAP: '',

        // 客户端开发环境 webpack-dev-server 端口号 (仅限 STAGE: client && ENV: dev)
        WEBPACK_DEV_SERVER_PORT: 3001,

        // 服务器端口
        SERVER_PORT: process.env.WEBPACK_BUILD_ENV === 'dev' ? '3000' : '8080',

        // 服务器端口 (开发模式主服务器)
        SERVER_PORT_DEV_MAIN: '3000',

        // Koot 项目启动目录路径。默认为 process.cwd()
        // KOOT_CWD: process.cwd(),

        // Koot 项目配置文件路径 (./koot.js)。默认不存在。如果存在则默认使用
        // KOOT_PROJECT_CONFIG_PATHNAME: ...,

        // Koot 打包配置文件路径 (./koot.build.js)。默认不存在。如果存在则默认使用
        // KOOT_BUILD_CONFIG_PATHNAME: ...,

        // 项目名。默认会在进行 Webpack 打包开始前，从项目配置中抽取并写入到环境变量
        // KOOT_PROJECT_NAME: ...,

        // 项目类型。默认不存在。如果存在则默认使用
        // KOOT_PROJECT_TYPE: ...,

        // 总开关：i18n/多语言相关处理
        KOOT_I18N: JSON.stringify(false),
        // i18n处理方式
        KOOT_I18N_TYPE: JSON.stringify(''),
        // 语言包
        KOOT_I18N_LOCALES: JSON.stringify([]),
        // 使用的COOKIE KEY
        KOOT_I18N_COOKIE_KEY: 'spLocaleId',
        // i18n cookie 影响的域名
        // KOOT_I18N_COOKIE_DOMAIN: '',

        // HTML模板内容
        // KOOT_HTML_TEMPLATE: '',

        // 打包目标路径（相对运行目录）
        // KOOT_DIST_DIR: '',

        // PWA Service-Worker 脚本是否自动注册
        KOOT_PWA_AUTO_REGISTER: JSON.stringify(defaultsPWA.auto),
        // PWA Service-Worker 访问路径
        KOOT_PWA_PATHNAME: JSON.stringify(defaultsPWA.pathname),

        // 当前是否是测试模式
        KOOT_TEST_MODE: JSON.stringify(false),
    }
    for (let key in defaults) {
        if (typeof process.env[key] === 'undefined') {
            process.env[key] = defaults[key]
        }
    }
}
