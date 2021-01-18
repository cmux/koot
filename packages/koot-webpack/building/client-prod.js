/* eslint-disable no-console */

const fs = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');

const {
    keyConfigQuiet,
    keyConfigBuildDll,
    keyConfigWebpackSPATemplateInject,
} = require('koot/defaults/before-build');

const __ = require('koot/utils/translate');
const spinner = require('koot/utils/spinner');

const statsHandling = require('../libs/building-webpack-stats-handling');

async function buildClientProd({
    appConfig = {},
    resultStats = {},

    beforeEachBuild,
    afterEachBuild,
    onError,
    onComplete,

    log,
} = {}) {
    const {
        webpackConfig,
        pathnameChunkmap,
        [keyConfigQuiet]: quietMode = false,
        [keyConfigBuildDll]: createDll = false,
    } = appConfig;
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        KOOT_TEST_MODE,
    } = process.env;
    const kootTest = JSON.parse(KOOT_TEST_MODE);

    // process.env.NODE_ENV = 'production'
    if (!fs.existsSync(pathnameChunkmap) && !createDll) {
        await fs.ensureFile(pathnameChunkmap);
        await fs.writeJson(
            pathnameChunkmap,
            {},
            {
                spaces: 4,
            }
        );
    }

    let spinnerBuildingSingle;
    let errorEncountered = false;

    // 执行打包
    const build = async (config, onComplete = afterEachBuild) => {
        const {
            [keyConfigWebpackSPATemplateInject]: isSPATemplateInject = false,
        } = config;
        delete config[keyConfigWebpackSPATemplateInject];
        // if (isSPATemplateInject) {
        //     config[keyConfigQuiet] = true;
        // }

        /** @type {Boolean} Webpack 自我输出过错误信息 */
        // let webpackLoggedError = false

        const error = (err) => {
            errorEncountered = true;

            if (spinnerBuildingSingle) spinnerBuildingSingle.stop();

            // if (!webpackLoggedError) {
            //     buildingError(err)
            // }

            throw err;
        };

        try {
            await beforeEachBuild();
            // const compiler = webpack(config);
            // console.log('compiler')
            await new Promise((resolve, reject) => {
                // compiler.run(async (err, stats) => {
                webpack(config, async (err, stats) => {
                    if (err && !stats) {
                        onComplete();
                        reject(
                            `webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`
                        );
                        return error(err);
                    }

                    const info = stats.toJson();

                    if (stats.hasWarnings()) {
                        if (Array.isArray(info.warnings)) {
                            for (const e of info.warnings)
                                resultStats.addWarning(e);
                        } else {
                            resultStats.addWarning(info.warnings);
                        }
                    }

                    if (stats.hasErrors()) {
                        onComplete();
                        console.log(
                            stats.toString({
                                chunks: false,
                                colors: true,
                            })
                        );
                        if (Array.isArray(info.erros)) {
                            for (const e of info.erros) error(e, false);
                            return resolve();
                        } else {
                            // webpackLoggedError = true
                            reject(
                                `webpack error: [${TYPE}-${STAGE}-${ENV}] ${info.errors}`
                            );
                            return error(info.errors);
                        }
                    }

                    if (err) {
                        onComplete();
                        reject(
                            `webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`
                        );
                        return error(err);
                    }

                    onComplete();

                    statsHandling(appConfig, err, stats, {
                        forceQuiet: isSPATemplateInject,
                    });

                    setTimeout(() => resolve(), 100);

                    // if (typeof compiler.close === 'function') compiler.close();
                });
            });
        } catch (e) {
            error(e);
        }
    };

    if (Array.isArray(webpackConfig)) {
        afterEachBuild();
        // console.log(' ')
        // let index = 0
        const thisComplete = (localeId) => {
            if (spinnerBuildingSingle) {
                if (resultStats.hasError()) {
                    spinnerBuildingSingle.fail();
                } else {
                    spinnerBuildingSingle.stop();
                    if (localeId)
                        setTimeout(() => {
                            console.log(' ');
                            log('success', 'build', chalk.green(`${localeId}`));
                        });
                }
            }
        };
        const createSpinner = (localeId) => {
            if (kootTest) return undefined;
            if (quietMode) return undefined;
            if (localeId)
                return spinner(
                    (
                        chalk.yellowBright('[koot/build] ') +
                        __('build.building_locale', {
                            locale: localeId,
                        })
                    ).replace(
                        new RegExp(' ' + localeId + '\\)'),
                        ` ${chalk.green(localeId)})`
                    )
                );
            return spinner(
                chalk.yellowBright('[koot/build] ') + __('build.building')
            );
        };
        for (const config of webpackConfig) {
            if (errorEncountered) break;
            console.log(' ');

            const localeId = (() => {
                const ids = config.plugins.filter(
                    (plugin) => plugin && typeof plugin.localeId === 'string'
                );
                if (ids.length) return ids.reduce((prev, cur) => cur.localeId);
                return false;
            })();
            spinnerBuildingSingle = createSpinner(localeId);
            await build(config, () => thisComplete(localeId)).catch(onError);
            // index++
        }
    } else {
        await build(webpackConfig).catch(onError);
        // console.log(' ')
    }

    await onComplete();
    return resultStats;
}

module.exports = buildClientProd;
