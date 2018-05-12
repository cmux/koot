#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const readBuildConfigFile = require('../utils/read-build-config-file')
const __ = require('../utils/translate')
const sleep = require('../utils/sleep')
const superBuild = require('../core/webpack/enter')
const exec = require('child_process').exec

program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]')
    // .option('--stage [stage]', 'STAGE')
    // .option('--env [env]', 'ENV')
    .parse(process.argv)

const run = async () => {
    // 在所有操作执行之前定义环境变量
    process.env.WEBPACK_BUILD_STAGE = 'client'
    process.env.WEBPACK_BUILD_ENV = 'prod'

    // 读取构建配置
    const buildConfig = await readBuildConfigFile()

    await superBuild({ ...buildConfig })
    await sleep(100)

    console.log('\n' + ''.padEnd(60, '=') + '\n')

    process.env.WEBPACK_BUILD_STAGE = 'server'
    await superBuild({ ...buildConfig })
    await sleep(100)

    console.log('\n' + ''.padEnd(60, '=') + '\n')

    // 运行
    exec(
        path.resolve(
            buildConfig.dist,
            'server/index.js'
        ),
        function callback(error, stdout, stderr) {
            console.log(error)
            console.log(stdout)
            console.log(stderr)
            // cb
        }
    )
}

run()
