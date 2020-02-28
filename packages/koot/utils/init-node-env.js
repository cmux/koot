const path = require('path');
const fs = require('fs-extra');

const defaultsServiceWorker = require('../defaults/service-worker');

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
        SERVER_PORT: (() => {
            if (process.env.WEBPACK_BUILD_ENV === 'dev') return '3000';
            if (typeof __SERVER_PORT__ !== 'undefined') return __SERVER_PORT__;
            return '8080';
        })(),

        // 服务器端口 (开发环境主服务器)
        SERVER_PORT_DEV_MAIN: '3000',

        // Koot 版本号
        KOOT_VERSION: encodeURI(
            fs.readJSONSync(path.resolve(__dirname, '../package.json')).version
        ),

        // Koot 项目启动目录路径。默认为 process.cwd()
        // KOOT_CWD: process.cwd(),

        // Koot 项目配置文件路径 (./koot.js)。默认不存在。如果存在则默认使用
        // KOOT_PROJECT_CONFIG_FULL_PATHNAME: ...,
        // KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME: ...,
        // KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME: ...,
        // KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME: ...,

        // Koot 打包配置文件路径 (./koot.build.js)。默认不存在。如果存在则默认使用
        // KOOT_BUILD_CONFIG_PATHNAME: ...,

        // 项目名。默认会在进行 Webpack 打包开始前，从项目配置中抽取并写入到环境变量
        // KOOT_PROJECT_NAME: ...,

        // 项目类型。默认不存在。如果存在则默认使用
        // KOOT_PROJECT_TYPE: ...,

        // history 类型
        // KOOT_HISTORY_TYPE: ...,

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
        // i18n URL 使用方式
        KOOT_I18N_URL_USE: 'query',

        // HTML模板内容
        // KOOT_HTML_TEMPLATE: '',

        // 打包目标路径（相对运行目录）
        // KOOT_DIST_DIR: '',

        // PWA Service-Worker 脚本是否自动注册
        KOOT_PWA_AUTO_REGISTER: JSON.stringify(defaultsServiceWorker.auto),
        // PWA Service-Worker 访问路径
        KOOT_PWA_PATHNAME: JSON.stringify(`/${defaultsServiceWorker.filename}`),

        // 当前是否是测试模式
        KOOT_TEST_MODE: JSON.stringify(false),

        // 当前是否是内部开发模式
        KOOT_DEVELOPMENT_MODE: JSON.stringify(false),

        // 开发环境启动时间
        // KOOT_DEV_START_TIME: Date.now(),

        // 开发环境: DLL 文件路径
        // KOOT_DEV_DLL_FILE_CLIENT: '',
        // KOOT_DEV_DLL_FILE_SERVER: '',

        // 开发环境: webpack-dev-server 扩展配置对象
        KOOT_DEV_WDS_EXTEND_CONFIG: JSON.stringify({}),

        // 定制的环境变量键值
        KOOT_CUSTOM_ENV_KEYS: JSON.stringify([]),

        // 配置: sessionStore
        KOOT_SESSION_STORE: JSON.stringify(false),

        KOOT_SSR_PUBLIC_PATH: JSON.stringify('/'),

        /** @type {string}
         * 服务器模式，可选模式
         * - _空_ - 默认模式
         * - serverless
         */
        KOOT_SERVER_MODE: ''

        // 打包开始时间
        // KOOT_BUILD_START_TIME: ''
    };
    for (const key in defaults) {
        if (typeof process.env[key] === 'undefined') {
            process.env[key] = defaults[key];
        }
    }
};
