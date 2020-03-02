const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;

// Libs & Utilities
const {
    keyConfigClientAssetsPublicPath
} = require('koot/defaults/before-build');
const getAppType = require('koot/utils/get-app-type');
const getChunkmapPathname = require('koot/utils/get-chunkmap-path');
const initNodeEnv = require('koot/utils/init-node-env');

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
 * 根据当前环境和配置，生成 Webpack 配置对象
 * @async
 * @param {Object} kootConfig Koot.js 打包配置对象 (koot.build.js)。具体内容详见模板项目的 koot.build.js 文件内注释。
 * @returns {Object} 生成的完整 Webpack 配置对象
 */
module.exports = async (kootConfig = {}) => {
    initNodeEnv();

    // 确定环境变量
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE
        // WEBPACK_ANALYZE,
        // SERVER_DOMAIN,
        // SERVER_PORT,
    } = process.env;

    const distClientAssetsDirName =
        kootConfig.distClientAssetsDirName || defaults.distClientAssetsDirName;
    const clientAssetsPublicPath = (() => {
        if (TYPE === 'spa' && ENV === 'dev') return `/`;
        if (TYPE === 'spa' && /^browser/.test(process.env.KOOT_HISTORY_TYPE))
            return `/${distClientAssetsDirName}/`;
        if (TYPE === 'spa') return `${distClientAssetsDirName}/`;
        return `/${distClientAssetsDirName}/`;
    })();

    // 抽取配置
    const kootBuildConfig = Object.assign({}, defaults, kootConfig, {
        appType: await getAppType(),
        distClientAssetsDirName,
        [keyConfigClientAssetsPublicPath]: clientAssetsPublicPath
    });
    const { analyze = false } = kootBuildConfig;

    if (process.env.WEBPACK_BUILD_ENV === 'dev' && kootBuildConfig.devPort) {
        process.env.SERVER_PORT = kootBuildConfig.devPort;
    } else if (
        process.env.WEBPACK_BUILD_ENV !== 'dev' &&
        kootBuildConfig.port
    ) {
        process.env.SERVER_PORT = kootBuildConfig.port;
    }
    // process.env.SERVER_PORT = kootBuildConfig.portServer

    // ========================================================================
    //
    // 处理配置 - 公共
    //
    // ========================================================================

    kootBuildConfig.dist = await transformDist(kootBuildConfig.dist);
    kootBuildConfig.i18n = await transformI18n(kootBuildConfig);
    kootBuildConfig.serviceWorker = await transformServiceWorker(
        kootBuildConfig
    );
    kootBuildConfig.template = await transformTemplate(
        kootBuildConfig.template
    );
    kootBuildConfig.pathnameChunkmap = await getChunkmapPathname();

    if (typeof kootBuildConfig.webpackConfig === 'function')
        kootBuildConfig.webpackConfig = await kootBuildConfig.webpackConfig();
    if (typeof kootBuildConfig.webpackConfig !== 'object')
        kootBuildConfig.webpackConfig = {};

    // ========================================================================
    //
    // 处理配置 - 客户端 / 开发 (CLIENT / DEV)
    //
    // ========================================================================

    const webpackConfig = await (async () => {
        let config;
        if (STAGE === 'client')
            config = await transformConfigClient(kootBuildConfig);
        if (STAGE === 'server')
            config = await transformConfigServer(kootBuildConfig);

        const extendConfig = config => {
            if (Array.isArray(config)) return config.map(c => extendConfig(c));

            if (typeof config.resolve !== 'object') config.resolve = {};
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                ...(kootBuildConfig.aliases || {})
            };
            return config;
        };
        extendConfig(config);

        // ====================================================================
        //
        // SPA 生产环境
        //
        // ====================================================================
        if (ENV === 'prod' && STAGE === 'client' && TYPE === 'spa') {
            process.env.WEBPACK_BUILD_STAGE = 'server';
            if (!Array.isArray(config)) config = config[0];
            config = [
                ...config,
                ...(await transformConfigServer(kootBuildConfig))
            ];
            process.env.WEBPACK_BUILD_STAGE = 'client';
        }

        // ====================================================================
        //
        // 模式: analyze
        //
        // ====================================================================

        if (analyze) {
            if (Array.isArray(config)) {
                config =
                    config[
                        ENV === 'prod' &&
                        STAGE === 'client' &&
                        TYPE === 'spa' &&
                        config.length > 1
                            ? 1
                            : 0
                    ];
            }
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerPort: process.env.SERVER_PORT,
                    defaultSizes: 'gzip'
                })
            );
        }

        return config;
    })();
    kootBuildConfig.webpackConfig = webpackConfig;

    // ========================================================================
    //
    // 返回结果
    //
    // ========================================================================

    // console.log({ kootBuildConfig });
    return kootBuildConfig;
};
