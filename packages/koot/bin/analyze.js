#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import program from 'commander';
// import chalk from 'chalk'

import kootWebpackBuild from 'koot-webpack/build.js';

import willValidateConfig from './lifecycle/will-validate-config.js';
import willBuild from './lifecycle/will-build.js';
import didBuild from './lifecycle/did-build.js';

// import __ from '../utils/translate.js'
import validateConfig from '../libs/validate-config/index.js';
// import readBuildConfigFile from '../utils/read-build-config-file.js'
import setEnvFromCommand from '../utils/set-env-from-command.js';
import initNodeEnv from '../utils/init-node-env.js';
import getDirTemp from '../libs/get-dir-tmp.js';
import getDirDevTmp from '../libs/get-dir-dev-tmp.js';

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
    process.env.WEBPACK_ANALYZE = JSON.stringify(true);

    await willValidateConfig(program);

    // 处理目录
    const dirAnalyzeBuild = getDirDevTmp(undefined, 'analyze');
    await fs.ensureDir(dirAnalyzeBuild);
    await fs.emptyDir(dirAnalyzeBuild);
    await fs.ensureDir(path.resolve(dirAnalyzeBuild, 'public'));
    await fs.ensureDir(path.resolve(dirAnalyzeBuild, 'server'));

    // 读取构建配置
    const kootConfig = {
        ...(await validateConfig()),

        dist: dirAnalyzeBuild,
        bundleVersionsKeep: false,
        analyze: true,
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
