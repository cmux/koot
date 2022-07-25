#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');

const willValidateConfig = require('./lifecycle/will-validate-config');
const willBuild = require('./lifecycle/will-build');
const didBuild = require('./lifecycle/did-build');

const {
    // keyConfigQuiet,
    filenameBuilding,
} = require('../defaults/before-build');

const __ = require('../utils/translate');
const sleep = require('../utils/sleep');
const setEnvFromCommand = require('../utils/set-env-from-command');
const getAppType = require('../utils/get-app-type');
const validateConfig = require('../libs/validate-config');
const validateConfigDist = require('../libs/validate-config-dist');
const isFromStartCommand = require('../libs/is-from-start-command');
const spinner = require('../utils/spinner');
const initNodeEnv = require('../utils/init-node-env');
// const emptyTempConfigDir = require('../libs/empty-temp-config-dir')
const getDirTemp = require('../libs/get-dir-tmp');

const kootWebpackBuild = require('koot-webpack/build');

program
    .version(require('../package').version, '-v, --version')
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
