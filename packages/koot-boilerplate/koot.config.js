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

    name: 'Koot Boilerplate',
    type: 'react',
    dist: './dist',

    template: './src/index.ejs',
    templateInject: './src/index.inject.js',

    routes: './src/router',

    store: './src/store',
    cookiesToStore: true,

    i18n: [
        ['zh', './src/locales/zh.json'],
        ['en', './src/locales/en.json'],
    ],

    pwa: true,

    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '@components': path.resolve('./src/components'),
        '@constants': path.resolve('./src/constants'),
        '@locales': path.resolve('./src/locales'),
        '@router': path.resolve('./src/router'),
        '@services': path.resolve('./src/services'),
        '@store': path.resolve('./src/store'),
        '@views': path.resolve('./src/views'),
    },
    defines: {
        __PRO__: JSON.stringify(false),
        __TEST__: JSON.stringify(false),
        __DEV__: JSON.stringify(true)
    },

    staticCopyFrom: path.resolve(__dirname, './src/assets/public'),

    // 更多选项请查阅文档...










    /**************************************************************************
     * 客户端生命周期
     *************************************************************************/

    // 选项请查阅文档...










    /**************************************************************************
     * 服务器端设置 & 生命周期
     *************************************************************************/

    port: 8081,
    proxyRequestOrigin: {
        protocol: 'https',
    },
    // 更多选项请查阅文档...










    /**************************************************************************
     * Webpack 相关
     *************************************************************************/

    webpackConfig: async () => {
        if (process.env.WEBPACK_BUILD_ENV === 'dev')
            return await require('./config/webpack/dev')
        return await require('./config/webpack/prod')
    },
    webpackBefore: async (/* kootConfig */) => {
        if (process.env.WEBPACK_BUILD_STAGE === 'client') {
            const dist = process.env.KOOT_DIST_DIR
            await fs.remove(path.resolve(dist, 'public'))
            await fs.remove(path.resolve(dist, 'server'))
        }
        return
    },
    moduleCssFilenameTest: /\.(module|view|component)/,
    internalLoaderOptions: {
        'less-loader': {
            modifyVars: {
                '@font-size-base': '12px' 
            }
        }
    },
    // 更多选项请查阅文档...










    /**************************************************************************
     * 开发模式
     *************************************************************************/

    devPort: 3088,
    devDll: [
        'react',
        'react-dom',
        'redux',
        'react-redux',
        'react-router',
        'react-router-redux',
        'koot',
        'axios',
        'prop-types',
        'classnames',
        'universal-cookie',
    ],
    // 更多选项请查阅文档...

}
