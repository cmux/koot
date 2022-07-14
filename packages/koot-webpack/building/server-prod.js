/* eslint-disable no-console */

const fs = require('fs-extra');
const webpack = require('webpack');

// const __ = require('koot/utils/translate');

const statsHandling = require('../libs/building-webpack-stats-handling');

async function buildServerProd({
    appConfig = {},
    resultStats = {},

    beforeEachBuild,
    afterEachBuild,
    onError,
    onComplete,

    log,
} = {}) {
    const { webpackConfig, pathnameChunkmap } = appConfig;
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
    } = process.env;

    // process.env.NODE_ENV = 'production'
    // process.env.WEBPACK_SERVER_PUBLIC_PATH =
    //     (typeof webpackConfigs.output === 'object' && webpackConfigs.output.publicPath)
    //         ? webpackConfigs.output.publicPath
    //         : ''

    // 确定 chunkmap
    // 如果没有设定，创建空文件
    if (!fs.pathExistsSync(pathnameChunkmap)) {
        await fs.ensureFile(pathnameChunkmap);
        process.env.WEBPACK_CHUNKMAP = '';
        // console.log(chalk.green('√ ') + chalk.greenBright('Chunkmap') + ` file does not exist. Crated an empty one.`)
    } else {
        try {
            process.env.WEBPACK_CHUNKMAP = JSON.stringify(
                await fs.readJson(pathnameChunkmap)
            );
        } catch (e) {
            process.env.WEBPACK_CHUNKMAP = '';
        }
    }

    /** @type {Boolean} Webpack 自我输出过错误信息 */
    let webpackLoggedError = false;

    const error = (err, logging = true) => {
        if (!webpackLoggedError) {
            onError(err);
            if (logging) console.error(err);
        }
        throw err;
    };

    try {
        await beforeEachBuild();
        await new Promise((resolve, reject) => {
            webpack(webpackConfig, (err, stats) => {
                if (err && !stats) {
                    afterEachBuild();
                    reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`);
                    return error(err);
                }

                const info = stats.toJson();

                if (stats.hasWarnings()) {
                    resultStats.addWarning(info.warnings);
                }

                if (stats.hasErrors()) {
                    afterEachBuild();
                    console.log(
                        stats.toString({
                            chunks: false,
                            colors: true,
                        })
                    );
                    webpackLoggedError = true;
                    // console.log(' ');
                    // console.log(' ');
                    // console.log(' ');
                    // console.log(' ');
                    // console.log(info.errors);
                    // console.log(' ');
                    // console.log(' ');
                    // console.log(' ');
                    // console.log(' ');
                    if (Array.isArray(info.erros)) {
                        for (const e of info.erros) error(e, false);
                    }
                    // reject(
                    //     `webpack error: [${TYPE}-${STAGE}-${ENV}] ${info.errors}`
                    // );
                    // return error(info.errors);
                    return resolve();
                }

                if (err) {
                    afterEachBuild();
                    reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`);
                    return error(err);
                }

                afterEachBuild(true);
                // if (!quietMode) console.log(' ');

                statsHandling(appConfig, err, stats);

                resolve();
            });
        });

        await onComplete();
    } catch (e) {
        error(e);
    }

    return resultStats;
}

module.exports = buildServerProd;
