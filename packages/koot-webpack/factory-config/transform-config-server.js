const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const DefaultWebpackConfig = require('webpack-config').default;
// const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin').default

const CopyWebpackPlugin = require('copy-webpack-plugin');
const KootI18nPlugin = require('../plugins/i18n');
const DevModePlugin = require('../plugins/dev-mode');
const ModifyServerBundlePlugin = require('../plugins/modify-server-bundle');

const {
    keyConfigBuildDll,
    // keyConfigClientAssetsPublicPath,
    keyConfigWebpackSPAServer,
} = require('koot/defaults/before-build');

const createTargetDefaultConfig = require('./create-target-default');
const transformConfigExtendDefault = require('./transform-config-extend-default');
const transformConfigLast = require('./transform-config-last');
const transformOutputPublicpath = require('./transform-output-publicpath');

const getCwd = require('koot/utils/get-cwd');
const getDirDistPublic = require('koot/libs/get-dir-dist-public');
// const getDirDevTmp = require('koot/libs/get-dir-dev-tmp');
const getModuleVersion = require('koot/utils/get-module-version');

/**
 * Webpack 配置处理 - 服务器端配置
 * @async
 * @param {Object} kootBuildConfig
 * @returns {Object} 处理后的配置
 */
module.exports = async (kootBuildConfig = {}) => {
    const {
        webpackConfig: config = {},
        appType,
        dist,
        // [keyConfigClientAssetsPublicPath]: __clientAssetsPublicPath,
        i18n,
        staticCopyFrom: staticAssets,
        template,
        serverless = false,
        [keyConfigBuildDll]: createDll = false,
    } = kootBuildConfig;

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
            (serverless || process.env.KOOT_SERVER_MODE === 'serverless')
    );

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
        .merge(config);

    const isPublicPathProvided = Boolean(
        process.env.WEBPACK_BUILD_ENV === 'prod' &&
            typeof config === 'object' &&
            typeof config.output === 'object' &&
            typeof config.output.publicPath === 'string'
    );

    await transformConfigExtendDefault(result, kootBuildConfig);

    Object.assign(result.output, configTargetDefault.output);

    // output =================================================================
    result.output = {
        publicPath: '/',
        filename: `[name].js`,
        chunkFilename: `chunk.[chunkhash].js`,
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
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new KootI18nPlugin({
            stage: STAGE,
            functionName: i18n ? i18n.expr : undefined,
        }),
        ...result.plugins,
    ];

    if (i18n && Array.isArray(i18n.locales) && i18n.locales.length > 0) {
        result.plugins.push(
            new CopyWebpackPlugin(
                i18n.locales.map((arr) => {
                    return {
                        from: arr[2],
                        to: arr[3],
                        // to: '../.locales/'
                        // to: path.resolve(getDirDevTmp(), 'locales')
                    };
                })
            )
        );
    }

    if (ENV === 'dev') {
        result.watchOptions = {
            ignored: [
                // /node_modules/,
                // 'node_modules',
                dist,
                path.resolve(dist, '**/*'),
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
            appType + `/server` + (isServerless ? '/index-serverless.js' : '')
        ),
    ];
    const otherEntries = {};
    if (isSPAProd) {
    } else {
        const fileSSR = require('../libs/get-koot-file')(
            `${appType}/server/ssr.js`
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
            // copied from `'minimal'`
            all: false,
            modules: true,
            maxModules: 0,
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
            plugins: [
                new ModifyServerBundlePlugin({ isServerless }),
                ...result.plugins,
            ],
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
                        new CopyWebpackPlugin(
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
