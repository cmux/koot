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

    template: './src/template.ejs',
    templateInject: './server/inject',
    routes: './src/router',
    store: './src/store/create',
    i18n: [
        ['zh', './src/locales/zh.json'],
        ['zh-tw', './src/locales/zh-tw.json'],
        ['en', './src/locales/en.json']
    ],
    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '@components': path.resolve('./src/components'),
        '@constants': path.resolve('./src/constants'),
        '@services': path.resolve('./src/services'),
        '@store': path.resolve('./src/store'),
        '@views': path.resolve('./src/views'),
        '@server': path.resolve('./server'),
        '~base.less': path.resolve('./src/constants/less/base.less'),
        '~Assets': path.resolve('./src/assets'),
        '~/': path.resolve('./src')
    },
    defines: {
        __QA__: JSON.stringify(false)
    },
    staticCopyFrom: path.resolve(__dirname, './public'),
    serverBefore: './server/lifecycle/before',
    webpackConfig: async () => {
        const ENV = process.env.WEBPACK_BUILD_ENV;
        if (ENV === 'dev') return await require('./config/webpack/dev');
        if (ENV === 'prod') return await require('./config/webpack/prod');
        return {};
    },
    webpackBefore: async (/* kootConfig */) => {
        console.log('\n\n💢 webpackBefore');
        if (process.env.WEBPACK_BUILD_STAGE === 'client') {
            const dist = process.env.KOOT_DIST_DIR;
            await fs.remove(path.resolve(dist, 'public'));
            await fs.remove(path.resolve(dist, 'server'));
        }
        return;
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
    devHmr: {
        multiStep: false
    },
    devServer: {
        quiet: true
    }
};
