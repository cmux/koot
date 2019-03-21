/**
 * @module kootConfig
 *
 * Koot.js 项目配置
 *
 * 配置文档请查阅: [https://koot.js.org/#/config]
 */

const fs = require('fs-extra');
const path = require('path');

module.exports = {
    /**************************************************************************
     * 项目信息
     *************************************************************************/

    name: 'Koot.js Tech Demo',
    type: 'react',
    dist: './dist',

    template: './src/index.ejs',
    templateInject: './src/index.inject.js',

    routes: './src/routes',

    store: './src/store',
    cookiesToStore: true,

    i18n: [['zh', './src/locales/zh.json'], ['en', './src/locales/en.json']],

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
        '~vars.less': path.resolve('./src/assets/css/_all.less'),
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
    serverBefore: './src/server/before.js',
    // 更多选项请查阅文档...

    /**************************************************************************
     * Webpack 相关
     *************************************************************************/

    webpackConfig: require('./config/webpack'),
    webpackBefore: async ({ dist }) => {
        // 每次打包前清空打包目录
        if (process.env.WEBPACK_BUILD_STAGE === 'client') {
            await fs.emptyDir(dist);
        }
    },
    // 更多选项请查阅文档...

    /**************************************************************************
     * 开发环境
     *************************************************************************/

    devPort: 3000,
    devDll: [
        'react',
        'react-dom',
        'redux',
        'react-redux',
        'react-router',
        'react-router-redux',
        'koot',
        'axios',
        'classnames',
    ],
    // 更多选项请查阅文档...
};
