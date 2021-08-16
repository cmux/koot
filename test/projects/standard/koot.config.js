/**
 * @module kootConfig
 *
 * Koot.js 项目配置
 *
 * 配置文档请查阅: [https://koot.js.org/#/config]
 */

require('koot/typedef');
const fs = require('fs-extra');
const path = require('path');
const { KOOT_BUILD_START_TIME } = require('koot/defaults/envs');

// console.log(process.env.WEBPACK_BUILD_STAGE);

/** @type {AppConfig} */
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

    store: './src/store/create-method-1',
    cookiesToStore: true,
    sessionStore: true,

    // i18n: {
    //     // type: 'redux', // 仅影响 client-prod 环境
    //     // type: 'store', // 仅影响 client-prod 环境
    //     // use: 'router',
    //     locales: [
    //         ['zh', './src/locales/zh.json'],
    //         ['zh-tw', './src/locales/zh-tw.json'],
    //         ['en', './src/locales/en.json']
    //     ]
    // },
    i18n: [
        ['zh', './src/locales/zh.json'],
        // ['zh-tw', './src/locales/zh-tw.json'],
        ['zh-tw', './src/locales/zh-tw.js'],
        ['en', './src/locales/en.json'],
    ],

    // pwa: true,
    serviceWorker: {
        cacheFirst: ['/photo.jpg'],
    },

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
        '~/': path.resolve('./src'),
        react: path.resolve(__dirname, '../../../node_modules/react'),
    },
    defines: {
        __QA__: JSON.stringify(false),
    },

    staticCopyFrom: [
        path.resolve(__dirname, './public'),
        // path.resolve(__dirname, './server')
    ],

    beforeBuild: async (appConfig) =>
        await testBeforeAfterBuild(appConfig, 'before'),
    afterBuild: async (appConfig) =>
        await testBeforeAfterBuild(appConfig, 'after'),

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

    port: 8980,
    renderCache: {
        maxAge: 10 * 1000,
    },
    // renderCache: false,
    proxyRequestOrigin: {
        // protocol: 'koot',
    },
    koaStatic: {
        index: 'test.photo.jpg',
        gzip: true,
    },
    serverBefore: './server/lifecycle/before',
    serverAfter: './server/lifecycle/after',
    serverOnRender: {
        beforePreRender: './server/lifecycle/on-render-before-pre-render',
        beforeDataToStore: './server/lifecycle/on-render-before-data-to-store',
        afterDataToStore: './server/lifecycle/on-render-after-data-to-store',
    },

    /**************************************************************************
     * Webpack 相关
     *************************************************************************/

    webpackConfig: async () => {
        const ENV = process.env.WEBPACK_BUILD_ENV;
        if (ENV === 'dev') return await require('./config/webpack/dev')();
        if (ENV === 'prod') return await require('./config/webpack/prod')();
        return {};
    },
    webpackBefore: async (/* kootConfig */) => {
        console.log('\n\n💢 webpackBefore');
        return;
    },
    webpackAfter: async () => {
        console.log('\n\n💢 webpackAfter');
        return;
    },
    moduleCssFilenameTest: [
        {
            test: /^((?!\.g\.).)*/,
            include: /biz-components/,
        },
        /^((?!\.g\.).)*/,
    ],
    internalLoaderOptions: {
        'less-loader': {
            lessOptions: {
                math: 'always',
            },
            modifyVars: {
                'base-font-size': '40px',
            },
            aaa: 'bbb',
        },
        'ts-loader': {
            context: __dirname,
            configFile: path.resolve(__dirname, './tsconfog.json'),
        },
    },

    /**************************************************************************
     * 开发模式
     *************************************************************************/

    devPort: 3080,
    // devHmr: {
    //     multiStep: false
    // },
    devServer: {
        quiet: true,
    },
};

// ============================================================================

/**
 * @async
 * @param {AppConfig} appConfig
 * @param {'before'|'after'} type
 * @void
 */
async function testBeforeAfterBuild(appConfig, type) {
    // const file = path.resolve(appConfig.dist, '_test-life-cycle.txt');
    const file = path.resolve(__dirname, 'dist/_test-life-cycle.txt');
    const timeMark = process.env[KOOT_BUILD_START_TIME];

    if (type === 'before') {
        await fs.ensureFile(file);
        await fs.remove(file);
        await fs.writeFile(file, `before mark: ${timeMark}\n`, 'utf-8');
    } else if (type === 'after') {
        if (!fs.existsSync(file)) return;
        await fs.writeFile(
            file,
            (await fs.readFile(file, 'utf-8')) + `after mark: ${timeMark}\n`
        );
    }
}
