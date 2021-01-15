/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const CliTable = require('cli-table');
const filesize = require('filesize');

const {
    keyConfigQuiet,
    WEBPACK_OUTPUT_PATH,
} = require('koot/defaults/before-build');

const elapse = require('koot/libs/elapse.js');
// const __ = require('koot/utils/translate');

async function buildServerProd({
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
        analyze = false,
        [keyConfigQuiet]: quietMode = false,
        [WEBPACK_OUTPUT_PATH]: outputPath,
    } = appConfig;
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
                    console.log(' ');
                    if (Array.isArray(info.erros)) {
                        for (const e of info.erros) error(e, false);
                    }
                    // reject(
                    //     `webpack error: [${TYPE}-${STAGE}-${ENV}] ${info.errors}`
                    // );
                    // return error(info.errors);
                    return;
                }

                if (err) {
                    afterEachBuild();
                    reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`);
                    return error(err);
                }

                afterEachBuild(true);
                // if (!quietMode) console.log(' ');

                if (!analyze && !quietMode) {
                    // console.log(info);

                    let time = 0;
                    const outputPaths = [];
                    const files = [];

                    function parseStats(stats) {
                        if (
                            Array.isArray(stats.children) &&
                            stats.children.length
                        ) {
                            for (const child of stats.children) {
                                parseStats(child);
                            }
                            return;
                        }
                        time += stats.time;
                        if (!outputPaths.includes(stats.outputPath))
                            outputPaths.push(stats.outputPath);
                        // console.log(
                        //     'assetsByChunkName:',
                        //     stats.assetsByChunkName
                        // );
                        // console.log('assets:', stats.assets);
                        // console.log('chunks:', stats.chunks);
                        if (Array.isArray(stats.chunks)) {
                            for (const chunk of stats.chunks) {
                                for (const f of chunk.files) files.push(f);
                                for (const f of chunk.auxiliaryFiles)
                                    files.push(f);
                            }
                        }
                    }
                    parseStats(info);

                    // log(
                    //     'success',
                    //     'build',
                    //     __('build.building')
                    // );
                    console.log(
                        `  > 该阶段用时 ${chalk.cyanBright(elapse(time))}`
                    );
                    for (const p of outputPaths.slice(1)) {
                        console.log(`             ${chalk.cyanBright(p)}`);
                    }
                    console.log(`  > 文件`);
                    const table = new CliTable({
                        chars: {
                            top: '',
                            'top-mid': '',
                            'top-left': '',
                            'top-right': '',
                            bottom: '',
                            'bottom-mid': '',
                            'bottom-left': '',
                            'bottom-right': '',
                            left: '',
                            'left-mid': '',
                            mid: '',
                            'mid-mid': '',
                            right: '',
                            'right-mid': '',
                            middle: ' ',
                        },
                        style: { 'padding-left': 0, 'padding-right': 0 },
                        colAligns: ['left', 'right'],
                    });
                    for (const pathname of files) {
                        const file = path.resolve(outputPath, pathname);
                        const lstat = fs.lstatSync(file);
                        table.push([
                            `    ${chalk.cyanBright(pathname)}`,
                            filesize(lstat.size, { round: 1 }),
                        ]);
                    }
                    console.log(table.toString());
                    // console.log(appConfig);
                    // console.log(
                    //     stats.toString({
                    //         chunks: false, // Makes the build much quieter
                    //         colors: true,
                    //     })
                    // );
                }

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
