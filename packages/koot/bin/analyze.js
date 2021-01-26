#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
// const chalk = require('chalk')

const willValidateConfig = require('./lifecycle/will-validate-config');
const willBuild = require('./lifecycle/will-build');
const didBuild = require('./lifecycle/did-build');

// const __ = require('../utils/translate')
const validateConfig = require('../libs/validate-config');
// const readBuildConfigFile = require('../utils/read-build-config-file')
const setEnvFromCommand = require('../utils/set-env-from-command');
const initNodeEnv = require('../utils/init-node-env');
const getDirTemp = require('../libs/get-dir-tmp');

const kootWebpackBuild = require('koot-webpack/build');

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('--stage <stage>', 'Set STAGE')
    .option('--config <config-file-path>', 'Set config file pathname')
    .option('--type <project-type>', 'Set project type')
    .option('--koot-test', 'Koot test mode')
    .parse(process.argv);

const run = async () => {
    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f');

    const { client, server, stage: _stage, config, type } = program.opts();

    initNodeEnv();
    // console.log(program)

    setEnvFromCommand({
        config,
        type,
    });

    const stage =
        _stage ||
        (client ? 'client' : undefined) ||
        (server ? 'server' : undefined) ||
        'client';

    process.env.WEBPACK_BUILD_STAGE = stage || 'client';
    process.env.WEBPACK_BUILD_ENV = 'prod';

    await willValidateConfig(program);

    // 处理目录
    const dirAnalyzeBuild = require('../libs/get-dir-dev-tmp')(
        undefined,
        'analyze'
    );
    await fs.ensureDir(dirAnalyzeBuild);
    await fs.emptyDir(dirAnalyzeBuild);
    await fs.ensureDir(path.resolve(dirAnalyzeBuild, 'public'));
    await fs.ensureDir(path.resolve(dirAnalyzeBuild, 'server'));

    // 读取构建配置
    const kootConfig = {
        ...(await validateConfig()),

        dist: dirAnalyzeBuild,
        bundleVersionsKeep: false,
    };

    await willBuild(kootConfig);

    await kootWebpackBuild({
        analyze: true,
        ...kootConfig,
    });

    // 清理临时目录
    await fs.remove(getDirTemp());

    // 清理结果目录
    await fs.remove(dirAnalyzeBuild);

    // 打包流程完成
    await didBuild(kootConfig);

    console.log(' ');
};

run();
