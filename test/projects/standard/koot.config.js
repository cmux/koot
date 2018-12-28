/**
 * @module kootConfig
 * 
 * Koot.js 项目配置
 * 
 * 配置文档请查阅: [https://koot.js.org/#/config]
 */

const fs = require('fs-extra')
const path = require('path')

module.exports = {

    /**************************************************************************
     * 项目信息
     *************************************************************************/

    name: 'Koot Test',
    type: 'react',
    dist: './dist',

    template: './src/template.ejs',
    templateInject: './server/inject',

    routes: './src/router',
    // historyType: 'hash',

    store: './src/store/create',
    cookiesToStore: 'all',

    i18n: {
        // type: 'redux', // 仅影响 client-prod 环境
        // use: 'router',
        locales: [
            ['zh', './src/locales/zh.json'],
            ['zh-tw', './src/locales/zh-tw.json'],
            ['en', './src/locales/en.json'],
        ]
    },

    pwa: true,

    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '@components': path.resolve('./src/components'),
        '@constants': path.resolve('./src/constants'),
        '@services': path.resolve('./src/services'),
        '@store': path.resolve('./src/store'),
        '@views': path.resolve('./src/views'),
        '@server': path.resolve('./server'),
        "~base.less": path.resolve('./src/constants/less/base.less'),
        "~Assets": path.resolve('./src/assets'),
        "~/": path.resolve('./src')
    },
    defines: {
        __QA__: JSON.stringify(false),
    },

    staticCopyFrom: path.resolve(__dirname, './public'),










    /**************************************************************************
     * 客户端生命周期
     *************************************************************************/

    before: './src/services/lifecycle/before',
    after: './src/services/lifecycle/after',
    onRouterUpdate: './src/services/lifecycle/on-router-update',
    onHistoryUpdate: './src/services/lifecycle/on-history-update',










    /**************************************************************************
     * 服务器端设置 & 生命周期
     *************************************************************************/

    port: 8080,
    renderCache: {
        maxAge: 10 * 1000,
    },
    proxyRequestOrigin: {
        // protocol: 'koot',
    },
    koaStatic: {
        maxage: 0,
        hidden: true,
        index: 'test.photo.jpg',
        defer: false,
        gzip: true,
        extensions: false
    },
    serverBefore: './server/lifecycle/before',
    serverAfter: './server/lifecycle/after',
    serverOnRender: {
        beforeDataToStore: './server/lifecycle/on-render-before-data-to-store',
        afterDataToStore: './server/lifecycle/on-render-after-data-to-store',
    },










    /**************************************************************************
     * Webpack 相关
     *************************************************************************/

    webpackConfig: async () => {
        const ENV = process.env.WEBPACK_BUILD_ENV
        if (ENV === 'dev') return await require('./config/webpack/dev')
        if (ENV === 'prod') return await require('./config/webpack/prod')
        return {}
    },
    webpackBefore: async (/* kootConfig */) => {
        console.log('\n\n💢 webpackBefore')
        if (process.env.WEBPACK_BUILD_STAGE === 'client') {
            const dist = process.env.KOOT_DIST_DIR
            await fs.remove(path.resolve(dist, 'public'))
            await fs.remove(path.resolve(dist, 'server'))
        }
        return
    },
    webpackAfter: async () => {
        console.log('\n\n💢 webpackAfter')
        return
    },
    moduleCssFilenameTest: /^((?!\.g\.).)*/,
    internalLoaderOptions: {
        'less-loader': {
            modifyVars: {
                'base-font-size': '40px'
            },
            aaa: 'bbb'
        }
    },










    /**************************************************************************
     * 开发模式
     *************************************************************************/

    devPort: 3080,
    devDll: [
        'react',
        'react-dom',
        'redux',
        'redux-thunk',
        'react-redux',
        'react-router',
        'react-router-redux',
        'koot',
    ],
    devHmr: {
        multiStep: false
    },
    devServer: {
        quiet: true
    },

}
