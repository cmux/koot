#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import program from 'commander';
import chalk from 'chalk';

import kootWebpackBuild from 'koot-webpack/build.js';

import willValidateConfig from './lifecycle/will-validate-config.js';
import willBuild from './lifecycle/will-build.js';
import didBuild from './lifecycle/did-build.js';

import {
    // keyConfigQuiet,
    filenameBuilding,
} from '../defaults/before-build.js';

import __ from '../utils/translate.js';
import sleep from '../utils/sleep.js';
import setEnvFromCommand from '../utils/set-env-from-command.js';
import getAppType from '../utils/get-app-type.js';
import validateConfig from '../libs/validate-config/index.js';
import validateConfigDist from '../libs/validate-config-dist.js';
import isFromStartCommand from '../libs/is-from-start-command.js';
import spinner from '../utils/spinner.js';
import initNodeEnv from '../utils/init-node-env.js';
// import emptyTempConfigDir from '../libs/empty-temp-config-dir.js';
import getDirTemp from '../libs/get-dir-tmp.js';

program
    .version(
        fs.readJsonSync(
            url.fileURLToPath(new URL('../package.json', import.meta.url))
        ).version,
        '-v, --version'
    )
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('--stage <stage>', 'Set STAGE')
    .option('--env <env>', 'Set ENV')
    .option('--dest <destination-path>', 'Set destination directory')
    .option('--config <config-file-path>', 'Set config file pathname')
    .option('--type <project-type>', 'Set project type')
    .option('--koot-dev', 'Koot dev env')
    .option('--koot-test', 'Koot test mode')
    .option('--koot-development', 'Koot development mode')
    .parse(process.argv);

/** Building result */
let result;

/**
 * 执行打包
 */
const run = async () => {
    const {
        client,
        server,
        stage: _stage,
        env = 'prod',
        config,
        type,
        dest,
        kootDev = false,
        kootTest = false,
        kootDevelopment = false,
    } = program.opts();

    initNodeEnv();
    // console.log(program)

    /** @type {Boolean} 是否为通过 koot-start 命令启动 */
    const fromCommandStart = isFromStartCommand();
    const fromOtherCommand = kootDev || fromCommandStart;
    if (!fromOtherCommand)
        // 清空 log
        process.stdout.write('\x1B[2J\x1B[0f');

    setEnvFromCommand(
        {
            config,
            type,
        },
        fromOtherCommand
    );

    process.env.KOOT_TEST_MODE = JSON.stringify(kootTest);
    process.env.KOOT_DEVELOPMENT_MODE = JSON.stringify(kootDevelopment);

    const stage = (() => {
        if (_stage) return _stage;
        if (client) return 'client';
        if (server) return 'server';
        return false;
    })();

    // 在所有操作执行之前定义环境变量
    process.env.WEBPACK_BUILD_STAGE = stage || 'client';
    process.env.WEBPACK_BUILD_ENV = env;
    process.env.NODE_ENV = env === 'dev' ? 'development' : 'production';

    // 清理临时目录
    await willValidateConfig(program);

    // 生成配置
    const kootConfig = await validateConfig();
    await getAppType();
    if (dest) kootConfig.dist = validateConfigDist(dest);

    // 如果通过 koot-start 命令启动...
    // if (fromCommandStart) {
    //     // 安静模式: 非报错 log 不打出
    //     kootConfig[keyConfigQuiet] = true;
    // }

    if (!fromOtherCommand) {
        await willBuild(kootConfig);
    }

    /** 流程结束 */
    async function finish() {
        await after(kootConfig);
        // if (!fromCommandStart)

        // 打包流程完成
        if (!fromOtherCommand) {
            await didBuild(kootConfig);
        }

        console.log(' ');
    }

    // Building process =======================================================

    // 如果提供了 stage，仅针对该 stage 执行打包
    // SPA: 强制仅打包 client
    if (process.env.WEBPACK_BUILD_TYPE === 'spa' || stage) {
        // if (stage === 'server' && !hasServer) {
        //     console.log(chalk.redBright('× '))
        // }
        // console.log(kootConfig);
        result = await kootWebpackBuild(kootConfig);
        return await finish();
    }

    // 如过没有提供 stage，自动相继打包 client 和 server
    result = await kootWebpackBuild({ ...kootConfig });
    await sleep(100);

    // if (!fromCommandStart)
    console.log('\n' + ''.padEnd(60, '=') + '\n');
    process.env.WEBPACK_BUILD_STAGE = 'server';
    result = await kootWebpackBuild({ ...kootConfig });
    await sleep(100);

    // if (!fromCommandStart)
    console.log('\n' + ''.padEnd(60, '=') + '\n');
    // if (!fromCommandStart)
    console.log(
        chalk.green('√ ') +
            chalk.yellowBright('[koot/build] ') +
            __('build.complete', {
                time: new Date().toLocaleString(),
            })
    );

    return await finish();
};

const after = async (config = {}) => {
    const ENV = process.env.WEBPACK_BUILD_ENV;

    const { dist } = config;

    if (ENV === 'prod') {
        // 清理临时目录
        await fs.remove(getDirTemp());
        // 移除临时配置文件
        // emptyTempConfigDir()
    }

    // 移除标记文件
    const fileBuilding = path.resolve(dist, filenameBuilding);

    if (fs.existsSync(fileBuilding)) await fs.remove(fileBuilding);
};

run().catch((err) => {
    if (!isFromStartCommand())
        spinner(chalk.yellowBright('[koot/build] ')).fail();

    if (result && Array.isArray(result.errors) && result.errors.length) {
        result.errors.forEach((e) => console.error(e));
    } else {
        console.error(err);
    }

    process.exit();
});
