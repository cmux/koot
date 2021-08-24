const fs = require('fs-extra');
const path = require('path');
// const webpack = require('webpack');
const DefaultWebpackConfig = require('webpack-config').default;
// const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin').default

// const KootI18nPlugin = require('../plugins/i18n');
const DevModePlugin = require('../plugins/dev-mode');
const ModifyServerBundlePlugin = require('../plugins/modify-server-bundle');

const newPluginCopyWebpack = require('../libs/new-plugin-copy');
const ensureConfigName = require('../libs/ensure-webpack-config/name');

const {
    keyConfigBuildDll,
    // keyConfigClientAssetsPublicPath,
    keyConfigWebpackSPAServer,
    defaultAssetModuleFilename,
} = require('koot/defaults/before-build');
const getCwd = require('koot/utils/get-cwd');
const getDirDistPublic = require('koot/libs/get-dir-dist-public');
const getDirDevTmp = require('koot/libs/get-dir-dev-tmp');
const getModuleVersion = require('koot/utils/get-module-version');

const createTargetDefaultConfig = require('./create-target-default');
const transformConfigExtendDefault = require('./transform-config-extend-default');
const transformConfigLast = require('./transform-config-last');
const transformOutputPublicpath = require('./transform-output-publicpath');
const LimitChunkCountPlugin = require('../plugins/limit-chunk-count');

const webpackConfigServerDefaults = require('./_defaults/server');

/**
 * Webpack 配置处理 - 服务器端配置
 * @async
 * @param {Object} kootBuildConfig
 * @returns {Object} 处理后的配置
 */
module.exports = async (kootBuildConfig = {}) => {
    const {
        webpackConfig: config = {},
        appTypeUse,
        dist,
        // [keyConfigClientAssetsPublicPath]: __clientAssetsPublicPath,
        i18n,
        staticCopyFrom: staticAssets,
        template,
        target,
        [keyConfigBuildDll]: createDll = false,
        distClientAssetsDirName,
    } = kootBuildConfig;

    const serverless = target === 'serverless';

    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        WEBPACK_DEV_SERVER_PORT: clientDevServerPort,
    } = process.env;

    const isSPAProd = Boolean(ENV === 'prod' && TYPE === 'spa');
    const isServerless = Boolean(
        process.env.WEBPACK_BUILD_STAGE === 'server' &&
            process.env.WEBPACK_BUILD_ENV === 'prod' &&
            process.env.WEBPACK_BUILD_TYPE === 'isomorphic' &&
            (serverless || process.env.KOOT_BUILD_TARGET === 'serverless')
    );

    const i18nConfig = {
        stage: STAGE,
        functionName: i18n ? i18n.expr : undefined,
    };

    /** 基于存放目录名的文件名前缀 */
    const filenamePrefix =
        process.env.WEBPACK_BUILD_ENV === 'prod' && distClientAssetsDirName
            ? `${distClientAssetsDirName}/`
            : '';

    const configTargetDefault = await createTargetDefaultConfig(
        {
            pathRun: getCwd(),
            clientDevServerPort,
        },
        undefined,
        kootBuildConfig
    );

    /** @type {Object} 当前环境的 webpack 配置对象 */
    const result = new DefaultWebpackConfig()
        .merge(configTargetDefault)
        .merge(config)
        .defaults(webpackConfigServerDefaults);

    const isPublicPathProvided = Boolean(
        process.env.WEBPACK_BUILD_ENV === 'prod' &&
            typeof config === 'object' &&
            typeof config.output === 'object' &&
            typeof config.output.publicPath === 'string'
    );

    await transformConfigExtendDefault(result, kootBuildConfig, {
        i18n: i18nConfig,
    });

    Object.assign(result.output, configTargetDefault.output);
    ensureConfigName(result, 'server');

    // output =================================================================
    result.output = {
        publicPath: '/',
        filename: `[name].js`,
        chunkFilename: `chunk.[chunkhash].js`,
        assetModuleFilename: `${filenamePrefix}${defaultAssetModuleFilename}`,
        ...(result.output || {}),
    };
    if (result.output.publicPath)
        result.output.publicPath = transformOutputPublicpath(
            result.output.publicPath
        );
    if (isPublicPathProvided)
        process.env.KOOT_SSR_PUBLIC_PATH = JSON.stringify(
            result.output.publicPath
        );
    // 如果用户自己配置了服务端打包路径，则覆盖默认的
    if (dist) result.output.path = path.resolve(dist, './server');
    if (isServerless) result.output.libraryTarget = 'commonjs2';

    // ========================================================================

    result.plugins = [
        // new KootI18nPlugin(i18nConfig),
        new LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new ModifyServerBundlePlugin({ isServerless }),
        ...result.plugins,
    ];

    if (i18n && Array.isArray(i18n.locales) && i18n.locales.length > 0) {
        result.plugins.push(
            newPluginCopyWebpack(
                i18n.locales.map((arr) => {
                    // 载入语言包，讲结果写入临时文件，复制该临时文件到打包目录
                    const localesObj = require(arr[2]);
                    const tmpFolder = getDirDevTmp(undefined, 'locales');
                    const tmp = path.resolve(tmpFolder, arr[0] + '.json');
                    fs.ensureDirSync(tmpFolder);
                    fs.writeJSONSync(tmp, localesObj);
                    return {
                        from: tmp,
                        to: arr[3],
                        // to: '../.locales/'
                        // to: path.resolve(getDirDevTmp(), 'locales')
                    };
                })
            )
        );
    }

    if (ENV === 'dev') {
        result.watch = true;
        result.watchOptions = {
            ignored: [
                // /node_modules/,
                // 'node_modules',
                dist,
                // path.resolve(dist, '**/*'),
            ],
        };
    }

    // entry / 入口
    const entryIndex = [
        // '@babel/register',
        // '@babel/polyfill',
        // 'core-js/stable',
        // path.resolve(__dirname, '../../../defaults/server-stage-0.js'),
        require('../libs/get-koot-file')(
            appTypeUse +
                `/server` +
                (isServerless ? '/index-serverless.js' : '')
        ),
    ];
    const otherEntries = {};
    if (isSPAProd) {
    } else {
        const fileSSR = require('../libs/get-koot-file')(
            `${appTypeUse}/server/ssr.jsx`
        );
        if (ENV !== 'dev' && fs.existsSync(fileSSR)) {
            otherEntries.ssr = [fileSSR];
            // result.plugins.push(
            //     new ExtraWatchWebpackPlugin({
            //         files: [
            //             fileSSR,
            //             fileSSR.replace(/\.js$/, '.hot-update.js')
            //         ]
            //     })
            // )
        }
        if (ENV === 'dev') {
            Object.keys(otherEntries).forEach((key) => {
                otherEntries[key].push('webpack/hot/poll?1000');
            });
        }
    }

    // 覆盖 optimization
    result.optimization = {
        splitChunks: false,
        removeAvailableModules: false,
        // removeEmptyChunks: false,
        mergeDuplicateChunks: false,
        // occurrenceOrder: false,
        concatenateModules: false,
    };
    try {
        if (parseInt(getModuleVersion('webpack')) < 5) {
            result.optimization.occurrenceOrder = false;
        }
    } catch (e) {
        result.optimization.occurrenceOrder = false;
    }

    // webpack stats
    if (isSPAProd) {
        result.stats = 'none';
    } else {
        if (typeof result.stats !== 'object') result.stats = {};
        Object.assign(result.stats, {
            preset: 'minimal',
            // copied from `'minimal'`
            all: false,
            modules: true,
            // maxModules: 0,
            errors: true,
            warnings: true,
            // our additional options
            moduleTrace: true,
            errorDetails: true,
            performance: false,
        });

        if (typeof result.performance !== 'object') result.performance = {};
        Object.assign(result.performance, {
            maxEntrypointSize: 1 * 1024 * 1024,
            maxAssetSize: 1 * 1024 * 1024,
        });
    }

    // 拆分
    const configsFull = [
        {
            ...result,
            entry: {
                index: entryIndex,
            },
            output: {
                ...result.output,
                filename: 'index.js',
            },
            plugins: [...result.plugins],
        },
    ];

    if (isSPAProd) {
        if (dist) configsFull[0].output.path = path.resolve(dist, './.server');
        configsFull[0][keyConfigWebpackSPAServer] = true;
        return await transformConfigLast(configsFull, kootBuildConfig);
    } else {
        Object.keys(otherEntries).forEach((entryName) => {
            configsFull.push({
                ...result,
                entry: {
                    [entryName]: otherEntries[entryName],
                },
                output: {
                    ...result.output,
                    filename: `${entryName}.js`,
                },
            });
        });

        // 对最后一个配置进行加工
        ((config) => {
            if (ENV === 'dev') {
                if (Array.isArray(staticAssets))
                    config.plugins.push(
                        newPluginCopyWebpack(
                            staticAssets.map((from) => ({
                                from,
                                to: path.relative(
                                    config.output.path,
                                    getDirDistPublic(dist)
                                ),
                            }))
                        )
                    );

                if (!createDll) {
                    config.plugins.push(new DevModePlugin({ dist, template }));
                }
            }
        })(configsFull[configsFull.length - 1]);

        //

        return await transformConfigLast(configsFull, kootBuildConfig);
    }
};
