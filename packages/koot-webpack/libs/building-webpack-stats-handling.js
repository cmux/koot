/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const CliTable = require('cli-table');
const filesize = require('filesize');

const {
    keyConfigQuiet,
    // keyConfigWebpackSPATemplateInject,
    WEBPACK_OUTPUT_PATH,
} = require('koot/defaults/before-build');

const elapse = require('koot/libs/elapse.js');

function statsHandling(
    appConfig = {},
    err,
    stats,
    { forceQuiet = false } = {}
) {
    // process.env.NODE_ENV = 'production'

    const {
        analyze = false,
        [keyConfigQuiet]: quietMode = false,
        // [keyConfigWebpackSPATemplateInject]: isSPATemplateInject = false,
        [WEBPACK_OUTPUT_PATH]: outputPath,
    } = appConfig;
    const { WEBPACK_BUILD_STAGE: STAGE } = process.env;

    const info = stats.toJson();

    if (!analyze && !quietMode && !forceQuiet) {
        if (STAGE === 'client') {
            console.log(
                stats.toString({
                    assets: false,
                    builtAt: true,
                    colors: true,
                    // modules: false,
                })
            );
            return;
        }

        // console.log(info);

        let time = 0;
        const outputPaths = [];
        const files = [];

        function parseStats(stats) {
            if (Array.isArray(stats.children) && stats.children.length) {
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
                    for (const f of chunk.auxiliaryFiles) files.push(f);
                }
            }
        }
        parseStats(info);

        // log(
        //     'success',
        //     'build',
        //     __('build.building')
        // );
        console.log(`  > 该阶段用时 ${chalk.cyanBright(elapse(time))}`);
        // for (const p of outputPaths.slice(1)) {
        //     console.log(`             ${chalk.cyanBright(p)}`);
        // }
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
            let file = path.resolve(outputPath, pathname);
            if (!fs.existsSync(file)) {
                file = path.resolve(outputPaths[0], pathname);
            }
            if (!fs.existsSync(file)) {
                continue;
            }
            const lstat = fs.lstatSync(file);
            table.push([
                `    ${chalk.cyanBright(pathname)}`,
                filesize(lstat.size, { round: 1 }),
            ]);
        }
        // console.log(appConfig);

        console.log(`  > 文件`);
        console.log(table.toString());
        // SERVER
        // console.log(
        //     stats.toString({
        //         chunks: false, // Makes the build much quieter
        //         colors: true,
        //     })
        // );
    }
}

module.exports = statsHandling;
