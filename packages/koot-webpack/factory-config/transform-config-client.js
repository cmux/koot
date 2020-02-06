const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const DefaultWebpackConfig = require('webpack-config').default;

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const KootI18nPlugin = require('../plugins/i18n');
const DevModePlugin = require('../plugins/dev-mode');
const SpaTemplatePlugin = require('../plugins/spa-template');
const GenerateChunkmapPlugin = require('../plugins/generate-chunkmap');
const CreateGeneralCssBundlePlugin = require('../plugins/create-general-css-bundle');

const {
    keyConfigBuildDll,
    keyConfigOutputPathShouldBe,
    keyConfigWebpackSPATemplateInject,
    keyConfigClientAssetsPublicPath,
    chunkNameClientRunFirst,
    keyConfigClientServiceWorkerPathname
} = require('koot/defaults/before-build');
const { hmrOptions } = require('koot/defaults/webpack-dev-server');

// const {
//     entryClientHMR
// } = require('koot/defaults/webpack-dev-server')

const createTargetDefaultConfig = require('./create-target-default');
const transformConfigExtendDefault = require('./transform-config-extend-default');
const transformConfigLast = require('./transform-config-last');
const transformOutputPublicpath = require('./transform-output-publicpath');
const newPluginWorkbox = require('../libs/new-plugin-workbox');

const getCwd = require('koot/utils/get-cwd');
const getWDSport = require('koot/utils/get-webpack-dev-server-port');
const getDirDistPublic = require('koot/libs/get-dir-dist-public');
const getDirTemp = require('koot/libs/get-dir-tmp');
const getFilenameSPATemplateInject = require('koot/libs/get-filename-spa-template-inject');
const validatePathname = require('koot/libs/validate-pathname');
const isI18nEnabled = require('koot/i18n/is-enabled');
const getModuleVersion = require('koot/utils/get-module-version');
const webpackOptimizationProd = require('koot/utils/webpack-optimization-prod');
const getSpaLocaleFileId = require('koot/libs/get-spa-locale-file-id');

/**
 * Webpack 配置处理 - 客户端配置
 * @async
 * @param {Object} kootConfigForThisBuild 完整的 Koot 项目配置（仅针对本次打包）
 * @returns {Object} 处理后的配置
 */
module.exports = async (kootConfigForThisBuild = {}) => {
    const {
        webpackConfig: config,
        appType,
        i18n,
        dist,
        template,
        templateInject,
        bundleVersionsKeep,
        distClientAssetsDirName,
        [keyConfigClientAssetsPublicPath]: __clientAssetsPublicPath,
        staticCopyFrom: staticAssets,
        analyze = false,
        devHmr: webpackHmr = {},
        [keyConfigBuildDll]: createDll = false,
        webpackCompilerHook = {}
    } = kootConfigForThisBuild;

    /** @type {String} 默认入口文件 */
    const defaultClientEntry = require('../libs/get-koot-file')(
        `${appType}/client`
    );

    /** @type {Boolean} 是否为 SPA 同时需要模板注入支持 */
    const isSPANeedTemplateInject = Boolean(
        process.env.WEBPACK_BUILD_TYPE === 'spa' &&
            !createDll &&
            typeof templateInject !== 'undefined'
    );

    /**
     * 创建 Webpack 配置对象
     * @async
     * @param {Object} options
     * @param {String} [options.localeId] 如果针对语种生成单一配置，请提供语种 ID
     * @param {Object} [options.localeFile] 如果针对语种生成单一配置，请提供语言包文件地址
     * @param {Number} [options.index=0] 如果针对语种生成单一配置，请提供当前语种的位置 index
     * @param {Boolean} [options.isSPATemplateInject=false] 是否是针对 SPA 模板注入生成单一配置
     * @returns {Object} Webpack 配置
     */
    const createConfig = async (options = {}) => {
        const {
            localeId,
            localeFile,
            isSPATemplateInject = false,
            index = 0
        } = options;
        const {
            WEBPACK_BUILD_TYPE: TYPE,
            WEBPACK_BUILD_ENV: ENV,
            WEBPACK_BUILD_STAGE: STAGE,
            WEBPACK_DEV_SERVER_PORT: clientDevServerPort
        } = process.env;

        /** @type {Boolean} 是否为多语言分包模式 */
        const isSeperateLocale = localeId && typeof localeFile === 'string';

        /** @type {String} 打包结果基础目录 (最终的打包目录是该目录下的 distClientAssetsDirName 目录) */
        const pathPublic = getDirDistPublic(dist, bundleVersionsKeep);

        /** @type {Object} 默认配置 */
        const configTargetDefault = await createTargetDefaultConfig({
            pathRun: getCwd(),
            clientDevServerPort,
            localeId
            /*APP_KEY: appName */
        });
        const configTargetDefaultOutput = {
            ...(configTargetDefault.output || {})
        };

        const thisConfig = new DefaultWebpackConfig().merge(config);

        // 跟进打包环境和用户自定义配置，扩展webpack配置
        if (thisConfig.__ext) {
            thisConfig.merge(thisConfig.__ext[ENV]);
        }

        // 如果自定义了，则清除默认
        if (thisConfig.entry) delete configTargetDefault.entry;
        if (thisConfig.output) delete configTargetDefault.output;

        const result = new DefaultWebpackConfig()
            .merge(configTargetDefault)
            .merge(
                await transformConfigExtendDefault(
                    thisConfig,
                    kootConfigForThisBuild,
                    {
                        isSPATemplateInject
                    }
                )
            );

        if (isSPATemplateInject) {
            const optimization = {
                splitChunks: false,
                removeAvailableModules: false,
                removeEmptyChunks: false,
                mergeDuplicateChunks: false,
                // occurrenceOrder: false,
                concatenateModules: false,
                minimize: false
            };
            try {
                if (parseInt(getModuleVersion('webpack')) < 5) {
                    optimization.occurrenceOrder = false;
                }
            } catch (e) {
                optimization.occurrenceOrder = false;
            }
            Object.assign(result, {
                target: 'async-node',
                entry: validatePathname(templateInject, getCwd()),
                output: {
                    filename: getFilenameSPATemplateInject(localeId),
                    path: getDirTemp()
                },
                optimization,
                [keyConfigWebpackSPATemplateInject]: true,
                stats: 'errors-only'
            });
            if (!Array.isArray(result.plugins)) result.plugins = [];
            if (localeId)
                result.plugins.push(
                    new webpack.DefinePlugin({
                        __KOOT_LOCALEID__: JSON.stringify(localeId)
                    })
                );
            delete result.optimization.minimizer;
        } else {
            // 处理 output
            // if (TYPE === 'spa') {
            //     result.output = configTargetDefault.output
            // }
            if (typeof result.output !== 'object') result.output = {};
            if (!result.output.path) {
                result.output.path = path.resolve(
                    pathPublic,
                    distClientAssetsDirName
                );
                result.output.publicPath = __clientAssetsPublicPath;
            }
            if (!result.output.publicPath) {
                result.output.publicPath = __clientAssetsPublicPath;
            }
            result.output.publicPath = transformOutputPublicpath(
                result.output.publicPath
            );

            // analyze 模式，强制修改输出文件名
            if (analyze) {
                // result.output.filename = 'entry-[id].[name].js'
                // result.output.chunkFilename = 'chunck-[id].[name].js'
                result.output.filename = 'entry-[id]-[name].js';
                result.output.chunkFilename = 'chunk-[id]-[name].js';
            } else {
                if (!result.output.filename)
                    result.output.filename =
                        configTargetDefaultOutput.filename ||
                        'entry.[chunkhash].js';
                if (!result.output.chunkFilename)
                    result.output.chunkFilename =
                        configTargetDefaultOutput.chunkFilename ||
                        'chunk.[chunkhash].js';
            }

            // [开发环境]
            if (ENV === 'dev') {
                // 标记打包目录（对应 prod 模式的结果）
                result[keyConfigOutputPathShouldBe] = path.resolve(
                    pathPublic,
                    distClientAssetsDirName
                );
                result.output.pathinfo = false;
            }

            // 处理 entry
            {
                if (typeof result.entry === 'object' && !result.entry.client) {
                    result.entry.client = defaultClientEntry;
                } else if (typeof result.entry !== 'object') {
                    result.entry = {
                        client: defaultClientEntry
                    };
                }
                if (ENV === 'dev') {
                    for (const key in result.entry) {
                        if (!Array.isArray(result.entry[key]))
                            result.entry[key] = [result.entry[key]];
                        // result.entry[key].unshift('react-hot-loader/patch');
                        result.entry[key].unshift(
                            'webpack/hot/only-dev-server'
                        );
                        result.entry[key].unshift(
                            `webpack-dev-server/client?http://localhost:${getWDSport()}/sockjs-node/`
                        );
                    }
                    // result.entry.client = [
                    //     'react-hot-loader/patch',
                    //     ...result.entry.client
                    // ];
                    // result.entry[entryClientHMR] = `webpack-dev-server/client?http://localhost:${getWDSport()}/sockjs-node/`
                }
                // const fileRunFirst = path.resolve(
                //     __dirname,
                //     '../../../',
                //     appType,
                //     './client/run-first.js'
                // )
                const fileRunFirst = require('../libs/get-koot-file')(
                    TYPE === 'spa'
                        ? 'ReactSPA/client/run-first.js'
                        : 'React/client-run-first.js'
                );
                if (fs.existsSync(fileRunFirst)) {
                    result.entry[chunkNameClientRunFirst] = [fileRunFirst];
                }
            }

            // 处理 optimization
            if (typeof result.optimization !== 'object')
                result.optimization =
                    ENV === 'dev' ? {} : webpackOptimizationProd();
            if (ENV === 'dev') {
                Object.assign(result.optimization, {
                    removeAvailableModules: false,
                    removeEmptyChunks: false,
                    splitChunks: false
                });
            }

            // 添加默认插件
            // i18n 插件
            result.plugins.unshift(
                new KootI18nPlugin({
                    stage: STAGE,
                    functionName: i18n ? i18n.expr : undefined,
                    localeId: i18n
                        ? isSeperateLocale
                            ? localeId
                            : undefined
                        : undefined,
                    localeFile: i18n
                        ? isSeperateLocale
                            ? localeFile
                            : undefined
                        : undefined
                })
            );

            // 开发环境辅助插件与其他能力
            if (ENV === 'dev') {
                result.plugins.push(
                    new DevModePlugin({
                        template,
                        ...webpackCompilerHook
                    })
                );
                try {
                    if (parseInt(getModuleVersion('webpack')) >= 5) {
                        if (typeof result.optimization !== 'object')
                            result.optimization = {};
                        result.optimization.moduleIds = 'named';
                    } else {
                        result.plugins.push(new webpack.NamedModulesPlugin());
                    }
                } catch (e) {
                    result.plugins.push(new webpack.NamedModulesPlugin());
                }
                result.plugins.push(
                    new webpack.HotModuleReplacementPlugin(
                        Object.assign({}, hmrOptions, webpackHmr)
                    )
                );
                // if (!createDll) {
                //     if (typeof result.resolve !== 'object') result.resolve = {};
                //     if (typeof result.resolve.alias !== 'object')
                //         result.resolve.alias = {};
                //     if (!result.resolve.alias['react-dom'])
                //         result.resolve.alias['react-dom'] =
                //             '@hot-loader/react-dom';
                // }
            }

            // 非 DLL 创建时 (即生产环境和开发环境正常打包)
            if (!createDll) {
                result.plugins.push(
                    await new CreateGeneralCssBundlePlugin({
                        localeId: isSeperateLocale ? localeId : undefined
                    })
                );

                if (!analyze) {
                    result.plugins.push(
                        await newPluginWorkbox(
                            kootConfigForThisBuild,
                            isSeperateLocale ? localeId : undefined
                        )
                    );
                }

                if (TYPE === 'spa') {
                    const isSPAi18nEnabled =
                        !isSeperateLocale &&
                        i18n &&
                        Array.isArray(i18n.locales) &&
                        i18n.locales.length;
                    if (isSPAi18nEnabled) {
                        for (const [localeId, , file] of i18n.locales) {
                            const tmpdir = path.resolve(
                                getDirTemp(),
                                'spa-locale-files'
                            );
                            const pathname = path.resolve(
                                tmpdir,
                                `${localeId}.js`
                            );
                            await fs.ensureDir(tmpdir);
                            await fs.writeFile(
                                pathname,
                                `import locales from '${file.replace(
                                    /\\/g,
                                    '\\\\'
                                )}'\n` +
                                    `import { setLocales } from 'koot/i18n/locales'\n` +
                                    `window.__KOOT_SSR_STATE__ = {
                                    localeId: '${localeId}',
                                    locales
                                };` +
                                    `setLocales(locales);`,
                                'utf-8'
                            );
                            result.entry[
                                getSpaLocaleFileId(localeId)
                            ] = pathname;
                        }
                    }
                    result.plugins.push(
                        new SpaTemplatePlugin({
                            template,
                            localeId: isSeperateLocale ? localeId : undefined,
                            locales: isSPAi18nEnabled
                                ? i18n.locales
                                : undefined,
                            // inject: templateInject,
                            inject: path.resolve(
                                getDirTemp(),
                                getFilenameSPATemplateInject(localeId)
                            ),
                            serviceWorkerPathname:
                                kootConfigForThisBuild[
                                    keyConfigClientServiceWorkerPathname
                                ]
                        })
                    );
                } else {
                    result.plugins.push(
                        await new GenerateChunkmapPlugin({
                            localeId: isSeperateLocale ? localeId : undefined,
                            pathPublic,
                            serviceWorkerPathname:
                                kootConfigForThisBuild[
                                    keyConfigClientServiceWorkerPathname
                                ]
                        })
                    );
                }

                if (
                    (ENV !== 'dev' || TYPE === 'spa') &&
                    Array.isArray(staticAssets) &&
                    !index
                ) {
                    result.plugins.push(
                        new CopyWebpackPlugin(
                            staticAssets.map(from => ({
                                from,
                                to:
                                    TYPE === 'spa' && ENV === 'dev'
                                        ? undefined
                                        : path.relative(
                                              result.output.path,
                                              pathPublic
                                          )
                                // to: path.relative(result.output.path, pathPublic)
                            }))
                        )
                    );
                }
            }

            // 生产环境专用
            if (ENV === 'prod') {
                result.plugins.push(new CompressionPlugin());
            }
        }

        return await transformConfigLast(result, kootConfigForThisBuild);
    };

    if (isI18nEnabled()) {
        switch (i18n.type || 'default') {
            case 'redux':
            case 'store': {
                if (isSPANeedTemplateInject)
                    return [
                        await createConfig({ isSPATemplateInject: true }),
                        await createConfig()
                    ];
                return await createConfig();
            }
            default: {
                // 多语言拆包模式: 每个语种一次打包
                const results = [];
                let index = 0;
                for (const locale of i18n.locales) {
                    const [localeId, , localeFile] = locale;
                    if (isSPANeedTemplateInject)
                        results.push(
                            await createConfig({
                                localeId,
                                localeFile,
                                index,
                                isSPATemplateInject: true
                            })
                        );
                    results.push(
                        await createConfig({ localeId, localeFile, index })
                    );
                    index++;
                }
                return results;
            }
        }
    } else {
        if (isSPANeedTemplateInject)
            return [
                await createConfig({ isSPATemplateInject: true }),
                await createConfig()
            ];
        return await createConfig();
    }
};
