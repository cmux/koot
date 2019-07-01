#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const execa = require('execa');

const before = require('./_before');

const {
    keyConfigQuiet,
    filenameBuilding
} = require('../defaults/before-build');

const __ = require('../utils/translate');
const sleep = require('../utils/sleep');
const setEnvFromCommand = require('../utils/set-env-from-command');
const getAppType = require('../utils/get-app-type');
const validateConfig = require('../libs/validate-config');
const validateConfigDist = require('../libs/validate-config-dist');
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
    .option('--no-init', 'Donot init')
    .parse(process.argv);

/** 判断是否是通过 koot-start 命令启动
 * @returns {Boolean}
 */
const isFromCommandStart = () =>
    process.env.KOOT_COMMAND_START &&
    JSON.parse(process.env.KOOT_COMMAND_START);

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
        init
    } = program;

    let fromCommandStart;
    let fromOtherCommand;
    let stage;

    /** 进行打包流程 */
    const start = async () => {
        // 生成配置
        const kootConfig = await validateConfig();
        await getAppType();
        if (dest) kootConfig.dist = validateConfigDist(dest);

        // 如果通过 koot-start 命令启动...
        if (fromCommandStart) {
            // 安静模式: 非报错 log 不打出
            kootConfig[keyConfigQuiet] = true;
        }

        // 如果提供了 stage，仅针对该 stage 执行打包
        // SPA: 强制仅打包 client
        if (process.env.WEBPACK_BUILD_TYPE === 'spa' || stage) {
            // if (stage === 'server' && !hasServer) {
            //     console.log(chalk.redBright('× '))
            // }
            await kootWebpackBuild(kootConfig);
            await after(kootConfig);
            if (!fromCommandStart) console.log(' ');
            return;
        }

        /*
        // 如过没有提供 stage，自动相继打包 client 和 server
        await kootWebpackBuild({ ...kootConfig });
        await sleep(100);

        if (!fromCommandStart) console.log('\n' + ''.padEnd(60, '=') + '\n');
        process.env.WEBPACK_BUILD_STAGE = 'server';
        await kootWebpackBuild({ ...kootConfig });
        await sleep(100);

        if (!fromCommandStart) console.log('\n' + ''.padEnd(60, '=') + '\n');
        if (!fromCommandStart)
            console.log(
                chalk.green('√ ') +
                    chalk.yellowBright('[koot/build] ') +
                    __('build.complete', {
                        time: new Date().toLocaleString()
                    })
            );
        */

        await after(kootConfig);
        if (!fromCommandStart) console.log(' ');

        // 结束
    };

    initNodeEnv();
    // console.log(program)

    /** @type {Boolean} 是否为通过 koot-start 命令启动 */
    fromCommandStart = isFromCommandStart();
    fromOtherCommand = kootDev || fromCommandStart;

    if (init) {
        // 清空 log
        if (!fromOtherCommand) process.stdout.write('\x1B[2J\x1B[0f');
        setEnvFromCommand(
            {
                config,
                type
            },
            fromOtherCommand
        );
    }

    process.env.KOOT_TEST_MODE = JSON.stringify(kootTest);

    stage = (() => {
        if (_stage) return _stage;
        if (client) return 'client';
        if (server) return 'server';
        return false;
    })();

    // 在所有操作执行之前定义环境变量
    process.env.WEBPACK_BUILD_STAGE = stage || 'client';
    process.env.WEBPACK_BUILD_ENV = env;

    if (init) {
        // 清理临时目录
        await before(program);
    }

    if (process.env.WEBPACK_BUILD_TYPE !== 'spa' && !stage) {
        const argObj = {
            env,
            dest,
            config,
            type
        };
        const args =
            Object.keys(argObj)
                .filter(key => typeof argObj[key] !== 'undefined')
                .map(key => `--${key} ${argObj[key]}`)
                .join(' ') +
            (kootDev ? ` --koot-dev` : '') +
            (kootTest ? ` --koot-test` : '') +
            ` --no-init`;

        const run = async args =>
            execa.node(path.resolve(__dirname, __filename), args.split(' '), {
                stdio: 'inherit',
                env: {
                    KOOT_COMMAND_START: process.env.KOOT_COMMAND_START,
                    KOOT_TEST_MODE: process.env.KOOT_TEST_MODE
                }
            });

        // build client
        // await execa.node(pathToBuild, [arguments], [options]);
        await run(`--client ${args}`);
        await sleep(100);
        if (!fromCommandStart) console.log('\n' + ''.padEnd(60, '=') + '\n');

        // build server
        await run(`--server ${args}`);
        await sleep(100);
        if (!fromCommandStart) console.log('\n' + ''.padEnd(60, '=') + '\n');
        if (!fromCommandStart)
            console.log(
                chalk.green('√ ') +
                    chalk.yellowBright('[koot/build] ') +
                    __('build.complete', {
                        time: new Date().toLocaleString()
                    })
            );

        return;
    }

    await start();

    return;
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

run().catch(err => {
    if (isFromCommandStart()) {
        // throw err
        return console.error(err);
    }
    spinner(chalk.yellowBright('[koot/build] ')).fail();
    console.trace(err);
});
