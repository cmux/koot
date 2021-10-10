const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Libs & Utilities
const {
    keyConfigClientAssetsPublicPath,
    keyConfigWebpackSPATemplateInject,
    // WEBPACK_MODIFIED_PUBLIC_PATH
} = require('koot/defaults/before-build');
const getAppType = require('koot/utils/get-app-type');
const getChunkmapPathname = require('koot/utils/get-chunkmap-path');
const initNodeEnv = require('koot/utils/init-node-env');
const resolveRequire = require('koot/utils/resolve-require');

// Transformers
const transformDist = require('./transform-dist');
const transformI18n = require('./transform-i18n');
const transformServiceWorker = require('./transform-service-worker');
const transformTemplate = require('./transform-template');
const transformConfigClient = require('./transform-config-client');
const transformConfigServer = require('./transform-config-server');

// Defaults & Data
const defaults = require('koot/defaults/build-config');

/**
 * 根据当前环境和配置，生成 App 配置对象
 * - 条件包含
 *     - 打包类型 (SSR, SPA, etc...)
 *     - 运行环境 (prod, dev)
 *     - 打包场景 (client, server)
 *     - 打包目标 (electron, serverless, etc...)
 * - 包含所有的 Koot.js 配置
 * - `webpackConfig` 替换为完整的 Webpack 配置对象
 * @async
 * @param {Object} kootConfig Koot.js 打包配置对象 (koot.build.js)。具体内容详见模板项目的 koot.build.js 文件内注释。
 * @returns {Object} 根据当前环境和配置的 App 配置对象
 */
module.exports = async (kootConfig = {}) => {
    initNodeEnv();

    // 确定环境变量
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        KOOT_BUILD_TARGET: TARGET,
        // WEBPACK_ANALYZE,
        // SERVER_DOMAIN,
        // SERVER_PORT,
    } = process.env;

    const distClientAssetsDirName =
        kootConfig.distClientAssetsDirName || defaults.distClientAssetsDirName;
    const clientAssetsPublicPath = (() => {
        if (TYPE === 'spa' && ENV === 'dev') return `/`;
        if (TYPE === 'spa' && /^browser/.test(process.env.KOOT_HISTORY_TYPE))
            return `/`;
        if (TYPE === 'spa') return ``;
        return `/`;
    })();

    // 抽取配置
    const appType = await getAppType();
    const appConfig = Object.assign({}, defaults, kootConfig, {
        appType,
        appTypeUse: appType === 'ReactElectronSPA' ? 'ReactSPA' : appType,
        distClientAssetsDirName,
        [keyConfigClientAssetsPublicPath]: clientAssetsPublicPath,
    });
    const { analyze = false, reactLegacyRef = false } = appConfig;

    if (process.env.WEBPACK_BUILD_ENV === 'dev' && appConfig.devPort) {
        process.env.SERVER_PORT = appConfig.devPort;
    } else if (process.env.WEBPACK_BUILD_ENV !== 'dev' && appConfig.port) {
        process.env.SERVER_PORT = appConfig.port;
    }
    // process.env.SERVER_PORT = appConfig.portServer
    process.env.KOOT_REACT_LEGACY_REF = JSON.stringify(reactLegacyRef);

    // ========================================================================
    //
    // 处理配置 - 公共
    //
    // ========================================================================

    appConfig.dist = await transformDist(appConfig.dist);
    appConfig.i18n = await transformI18n(appConfig);
    appConfig.serviceWorker = await transformServiceWorker(appConfig);
    appConfig.template = await transformTemplate(appConfig.template);
    appConfig.pathnameChunkmap = await getChunkmapPathname();

    if (typeof appConfig.webpackConfig === 'function')
        appConfig.webpackConfig = await appConfig.webpackConfig();
    if (typeof appConfig.webpackConfig !== 'object')
        appConfig.webpackConfig = {};

    // ========================================================================
    //
    // 处理配置 - 客户端 / 开发 (CLIENT / DEV)
    //
    // ========================================================================

    const webpackConfig = await (async () => {
        let config;
        if (STAGE === 'client') config = await transformConfigClient(appConfig);
        if (STAGE === 'server') config = await transformConfigServer(appConfig);

        const extendConfig = (config) => {
            if (Array.isArray(config))
                return config.map((c) => extendConfig(c));

            if (typeof config.resolve !== 'object') config.resolve = {};
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                ...(appConfig.aliases || {}),
            };
            return config;
        };
        extendConfig(config);

        // ====================================================================
        //
        // SPA 生产环境
        //
        // ====================================================================
        if (
            ENV === 'prod' &&
            STAGE === 'client' &&
            TYPE === 'spa' &&
            TARGET !== 'electron'
        ) {
            process.env.WEBPACK_BUILD_STAGE = 'server';
            if (!Array.isArray(config)) config = [config];
            config = [...config, ...(await transformConfigServer(appConfig))];
            process.env.WEBPACK_BUILD_STAGE = 'client';
        }

        // ====================================================================
        //
        // 模式: analyze
        //
        // ====================================================================

        if (analyze) {
            if (Array.isArray(config)) {
                // config =
                //     config[
                //         ENV === 'prod' &&
                //         STAGE === 'client' &&
                //         TYPE === 'spa' &&
                //         config.length > 1
                //             ? 1
                //             : 0
                //     ];
                config = config.filter(
                    (c) => !c[keyConfigWebpackSPATemplateInject]
                )[0];
            }
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerPort: process.env.SERVER_PORT,
                    defaultSizes: 'gzip',
                })
            );
        }

        return config;
    })();
    appConfig.webpackConfig = webpackConfig;

    // ========================================================================
    //
    // 最终处理
    //
    // ========================================================================

    if (STAGE === 'client' && TYPE === 'spa' && TARGET === 'electron') {
        await resolveRequire(
            'koot-electron',
            'libs/modify-config.js'
        )(appConfig);
    }

    // ========================================================================
    //
    // 返回结果
    //
    // ========================================================================

    // console.log({ appConfig });
    return appConfig;
};
