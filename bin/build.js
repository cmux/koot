#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const chalk = require('chalk')
const __ = require('../utils/translate')
const superBuild = require('../core/webpack/enter')

program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]')
    .option('--stage [stage]', 'STAGE')
    // .option('--env [env]', 'ENV')
    .parse(process.argv)

const sleep = (ms = 1) => new Promise(resolve =>
    setTimeout(resolve, ms)
)

const logBuildStart = (stage = process.env.WEBPACK_BUILD_STAGE) => {
    console.log(
        '\n'
        + chalk.yellowBright('[super/build] ')
        + __('build.build_start', {
            stage: chalk.green(stage)
        })
        + '\n'
    )
}

const logBuildComplete = (stage = process.env.WEBPACK_BUILD_STAGE) => {
    console.log(
        '\n'
        + chalk.green('√ ')
        + chalk.yellowBright('[super/build] ')
        + __('build.build_complete', {
            stage: chalk.green(stage)
        })
        + '\n'
    )
}

const run = async () => {
    const {
        stage,
        // env
    } = program

    // if (!stage) {
    //     console.log(
    //         chalk.red('× ')
    //         + __('build.missing_option', {
    //             option: chalk.yellowBright('stage'),
    //             example: 'super-build ' + chalk.green('--stage client') + ' --env prod',
    //             indent: '  '
    //         })
    //     )
    //     return
    // }

    // if (!env) {
    //     console.log(
    //         chalk.red('× ')
    //         + __('build.missing_option', {
    //             option: chalk.yellowBright('env'),
    //             example: 'super-build ' + chalk.green('--env prod'),
    //             indent: '  '
    //         })
    //     )
    //     return
    // }

    // 在所有操作执行之前定义环境变量
    process.env.WEBPACK_BUILD_STAGE = stage || 'client'
    process.env.WEBPACK_BUILD_ENV = 'prod'

    // 读取构建配置
    const pathnameBuildConfig = path.resolve(process.cwd(), './super.build.js')
    if (!fs.existsSync(pathnameBuildConfig)) {
        console.log(
            chalk.red('× ')
            + __('file_not_found', {
                file: chalk.yellowBright('./super.build.js'),
            })
        )
        return
    }
    const buildConfig = require(pathnameBuildConfig)
    if (typeof buildConfig !== 'object') {
        console.log(
            chalk.red('× ')
            + __('build.config_type_error', {
                file: chalk.yellowBright('./super.build.js'),
                type: chalk.green('Object')
            })
        )
        return
    }

    // 如果提供了 stage，仅针对 stage 执行打包
    if (stage) {
        process.env.WEBPACK_BUILD_STAGE = stage
        logBuildStart()
        await superBuild(buildConfig)
        await sleep(100)
        logBuildComplete()
        return
    }

    // 如过没有提供 stage，自动相继打包 client 和 server
    logBuildStart()
    await superBuild({ ...buildConfig })
    await sleep(100)
    logBuildComplete()

    console.log(''.padEnd(40, '='))

    process.env.WEBPACK_BUILD_STAGE = 'server'
    logBuildStart()
    await superBuild({ ...buildConfig })
    await sleep(100)
    logBuildComplete()
}

run()
