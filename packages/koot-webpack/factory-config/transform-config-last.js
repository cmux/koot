const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const md5 = require('md5');
const findCacheDir = require('find-cache-dir');

const {
    keyConfigBuildDll,
    filenameDllManifest,
    keyConfigOutputPathShouldBe,
    keyConfigWebpackSPATemplateInject,
    keyConfigWebpackSPAServer,
    WEBPACK_OUTPUT_PATH,
    // buildManifestFilename,
} = require('koot/defaults/before-build');
// const {
//     KOOT_BUILD_START_TIME,
//     KOOT_DEV_START_TIME,
// } = require('koot/defaults/envs');
const getDirDevDll = require('koot/libs/get-dir-dev-dll');

const transformClientDevDll = require('./transform-config-client-dev-dll');
const transformModifyForWebpack5 = require('./transform/modify-for-webpack-version/5.0');
const forWebpackVersion = require('../libs/for-webpack-version');
const ensureConfigName = require('../libs/ensure-webpack-config/name');

/**
 * Webpack 配置处理 - 最终处理，在分类型的最终处理之前
 * - 此处会保留一些标记用字段，会在后续步骤再做处理
 * @async
 * @param {Object|Array} config 本次打包的 Webpack 配置对象
 * @param {Object} kootConfigForThisBuild 完整的 Koot 项目配置（仅针对本次打包）
 * @return {Object|Array}
 */
const transform = async (config, kootConfigForThisBuild = {}, index = 0) => {
    const { [keyConfigBuildDll]: createDll = false } = kootConfigForThisBuild;
    // const {
    //     WEBPACK_BUILD_STAGE: STAGE,
    // } = process.env

    // 生成 DLL 包模式: 本次打包仅生成 DLL 包
    if (createDll) {
        return validate(
            await transformClientDevDll(config, kootConfigForThisBuild),
            kootConfigForThisBuild
        );
    }

    // 数组情况，拆分每项分别处理
    if (Array.isArray(config)) {
        const r = [];
        let i = 0;
        for (const thisConfig of config) {
            r.push(await transform(thisConfig, kootConfigForThisBuild, i));
            i++;
        }
        return r;
    }

    // copy this

    return validate(Object.assign({}, config), kootConfigForThisBuild, index);
};

/**
 * 生效处理
 * @param {Object} config 本次打包的 Webpack 配置
 * @returns {Object}
 */
const validate = (config, kootConfigForThisBuild, index = 0) => {
    // try to fix a pm2 bug that will currupt [name] value
    if (typeof config.output === 'object') {
        for (const key in config.output) {
            if (typeof config.output[key] === 'string')
                config.output[key] = config.output[key].replace(
                    /-_-_-_-_-_-(.+?)-_-_-_-_-_-/g,
                    '[name]'
                );
        }
    }

    ensureConfigName(config);

    // console.log('')
    // console.log('kootConfigForThisBuild', kootConfigForThisBuild)
    validatePlugins(config, kootConfigForThisBuild);
    validateModuleRules(config, kootConfigForThisBuild);

    // analyze
    // const isAnalyze = (JSON.parse(process.env.WEBPACK_ANALYZE) || config.analyze) ? true : false
    // if (isAnalyze) {
    //     config.output.filename = 'entry.[id].[name].js'
    //     config.output.chunkFilename = 'chunk.[id].[name].js'
    //     // config.plugins.push(
    //     //     new (webpackBundleAnalyzer.BundleAnalyzerPlugin)()
    //     // )
    // }

    // custom logic use
    delete config.__ext;
    delete config.spa;
    delete config.analyzer;
    delete config.htmlPath;

    // 针对 Webpack 4 处理
    forWebpackVersion('4.x', () => {
        // 这些选项会在 Webpack 5 中移除，对应 Webpack 4 的 false 配置
        // if (typeof config.node !== 'object') config.node = {};
        // config.node.Buffer = false;
        // config.node.process = false;
    });

    transformModifyForWebpack5(config);

    // 修改本次打包的 Koot 完整配置对象
    if (
        !config[keyConfigWebpackSPATemplateInject] &&
        !config[keyConfigWebpackSPAServer]
    )
        kootConfigForThisBuild[WEBPACK_OUTPUT_PATH] = config.output.path;

    // 移除其他多余字段
    delete config[keyConfigOutputPathShouldBe];
    // delete config[keyConfigWebpackSPATemplateInject];
    // delete config[keyConfigWebpackSPAServer];

    // 添加缓存配置
    {
        const cacheIdentifier =
            'koot-' +
            md5(
                [
                    config.name,
                    config.mode,
                    JSON.stringify(kootConfigForThisBuild),
                ].join('~')
            );
        if (
            process.env.WEBPACK_BUILD_ENV !== 'dev' &&
            process.env.WEBPACK_BUILD_STAGE === 'client' &&
            !config[keyConfigWebpackSPATemplateInject]
        ) {
            if (typeof config.cache === 'undefined') {
                config.cache = {
                    type: 'filesystem',
                    name: cacheIdentifier,
                };
            }
        }
        // 给 babel loader 添加缓存目录设定
        function modifyRule(rule) {
            if (Array.isArray(rule.oneOf)) {
                for (const _rule of rule.oneOf) modifyRule(_rule);
                return;
            }
            if (!Array.isArray(rule.use)) return;
            for (const { loader, options } of rule.use) {
                if (
                    /koot-webpack\\loaders\\babel\\index\.js$/.test(loader) &&
                    typeof options === 'object'
                ) {
                    options.cacheDirectory = findCacheDir({
                        name: 'babel-loader',
                        thunk: true,
                    })(cacheIdentifier);
                    // console.log(loader, options);
                }
            }
        }
        for (const rule of config.module.rules) {
            modifyRule(rule);
        }
    }

    return config;
};

/**
 * 生效处理: plugins
 * @param {Object} config
 * @returns {Object}
 */
const validatePlugins = (config, kootConfigForThisBuild = {}) => {
    const {
        WEBPACK_BUILD_ENV: ENV,
        // WEBPACK_BUILD_STAGE: STAGE,
    } = process.env;

    // 如果没有 plugins 项，创建空 Array
    if (!Array.isArray(config.plugins)) config.plugins = [];

    if (
        ENV === 'dev' &&
        !config[keyConfigWebpackSPATemplateInject] &&
        !kootConfigForThisBuild[keyConfigBuildDll]
    ) {
        // 如果查有 DLL 结果文件，添加 DllReferencePlugin
        // const file = STAGE === 'server'
        //     ? path.resolve(kootConfigForThisBuild.dist, 'server', filenameDllManifest)
        //     : path.resolve(kootConfigForThisBuild.dist, filenameDllManifest)
        const file = path.resolve(getDirDevDll(), filenameDllManifest);
        if (fs.existsSync(file)) {
            config.plugins.push(
                new webpack.DllReferencePlugin({
                    // context: path.resolve(__dirname, '../../../../'),
                    // scope: match[1],
                    manifest: file,
                })
            );
        }
        // const dir = path.resolve(kootConfigForThisBuild.dist, dirDll, STAGE)
        // if (fs.existsSync(dir)) {
        //     const regex = new RegExp(filenameDllManifest.replace('[name]', '^(.+)') + '$')
        //     fs.readdirSync(dir)
        //         .filter(filename => regex.test(filename))
        //         .forEach(filename => {
        //             const match = regex.exec(filename)
        //             config.plugins.push(
        //                 new webpack.DllReferencePlugin({
        //                     context: path.resolve(__dirname, '../../../../'),
        //                     // scope: match[1],
        //                     manifest: path.resolve(dir, filename)
        //                 })
        //             )
        //         })
        // }
    }

    // 清除 plugins 中的空项和非法项
    config.plugins = config.plugins.filter(
        (plugin) => typeof plugin !== 'undefined' && plugin !== null
    );
};

const validateModuleRules = (config, kootConfigForThisBuild = {}) => {
    const { distClientAssetsDirName } = kootConfigForThisBuild;

    // 删除重复 loader
    if (Array.isArray(config.module.rules)) {
        config.module.rules = removeDuplicateObject(config.module.rules);
        // 删除重复对象
        function removeDuplicateObject(list) {
            // let map = {}
            // list = (() => {
            //     return list.map((rule) => {
            //         let key = JSON.stringify(rule)
            //         key = key.toLowerCase().replace(/ /g, '')
            //         if (map[key])
            //             rule = undefined
            //         else
            //             map[key] = 1
            //         return rule
            //     })
            // })()
            return list.filter((rule) => !!rule);
        }
    }

    // 针对某个 loader 进行调整
    if (Array.isArray(config.module.rules)) {
        const validateLoader = (loader, options = {}) => {
            if (typeof loader === 'string' && loader.includes('?')) {
                const segs = loader.split('?');
                loader = segs[0];
                options = {};
                segs[1].split('&').forEach((pair) => {
                    const [key, value] = pair.split('=');
                    options[key] = value;
                });
            }
            switch (loader) {
                case 'file-loader':
                case 'url-loader':
                case 'svg-url-loader': {
                    if (process.env.WEBPACK_BUILD_STAGE === 'server') {
                        options.emitFile = false;
                    }
                    if (
                        process.env.WEBPACK_BUILD_ENV === 'prod' &&
                        distClientAssetsDirName
                    ) {
                        if (
                            options.name &&
                            !options.outputPath &&
                            !new RegExp(`^${distClientAssetsDirName}`).test(
                                options.name
                            )
                        ) {
                            options.name =
                                distClientAssetsDirName + '/' + options.name;
                        } else if (!options.name && !options.outputPath) {
                            options.name =
                                distClientAssetsDirName +
                                '/asset.[contenthash].[ext]';
                        }
                    }
                    break;
                }
                case require.resolve('../loaders/babel'): {
                    if (config.mode === 'development') {
                        if (typeof options.generatorOpts !== 'object')
                            options.generatorOpts = {};
                        if (
                            typeof options.generatorOpts.compact === 'undefined'
                        )
                            options.generatorOpts.compact = false;
                    }
                    break;
                }
                default: {
                }
            }
            return { loader, options };
        };
        const validateRule = (rule) => {
            // Make sure asset modules do not emit file for Server bundle
            if (['asset', 'asset/resource'].includes(rule.type)) {
                if (
                    // typeof rule.generator?.emit === 'undefined' &&
                    process.env.WEBPACK_BUILD_STAGE === 'server'
                ) {
                    if (typeof rule.generator === 'undefined')
                        rule.generator = {};
                    rule.generator.emit = false;
                }
            }
            if (typeof rule.loader === 'string') {
                const { loader, options } = validateLoader(
                    rule.loader,
                    rule.options
                );
                rule.loader = loader;
                rule.options = options;
            } else if (Array.isArray(rule.use)) {
                rule.use = rule.use.map((use) => {
                    if (typeof use === 'string') {
                        return validateLoader(use);
                    } else if (typeof use === 'object') {
                        return validateLoader(use.loader, use.options);
                    }
                    return use;
                });
            } else if (typeof rule.use === 'string') {
                rule.use = validateLoader(rule.use);
            } else if (typeof rule.use === 'object') {
                rule.use = validateLoader(rule.use.loader, rule.use.options);
            }
        };
        config.module.rules.forEach((rule) => {
            if (Array.isArray(rule.oneOf)) {
                rule.oneOf.forEach((thisRule) => validateRule(thisRule));
            } else {
                validateRule(rule);
            }
        });
    }
};

module.exports = transform;
