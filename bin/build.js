#!/usr/bin/env node

// const path = require('path')
const program = require('commander')
const chalk = require('chalk')

const __ = require('../utils/translate')
const readBuildConfigFile = require('../utils/read-build-config-file')
const sleep = require('../utils/sleep')
const setEnvFromCommand = require('../utils/set-env-from-command')

const superBuild = require('../core/webpack/enter')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('--stage <stage>', 'Set STAGE')
    .option('--env <env>', 'Set ENV')
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .parse(process.argv)

/**
 * 执行打包
 */
const run = async () => {
    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f')

    const {
        client, server,
        stage: _stage,
        env = 'prod',
        config,
        type,
    } = program

    setEnvFromCommand({
        config,
        type,
    })

    const stage = _stage ? _stage : (client ? 'client' : (server ? 'server' : false))

    // console.log(stage, env)

    // if (!stage) {
    //     console.log(
    //         chalk.redBright('× ')
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
    //         chalk.redBright('× ')
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
    process.env.WEBPACK_BUILD_ENV = env

    // 读取构建配置
    const buildConfig = await readBuildConfigFile()
    // const {
    //     server: hasServer
    // } = buildConfig

    // 如果提供了 stage，仅针对 stage 执行打包
    if (stage) {
        // if (stage === 'server' && !hasServer) {
        //     console.log(chalk.redBright('× '))
        // }
        return await superBuild(buildConfig)
    }

    // 如过没有提供 stage，自动相继打包 client 和 server
    await superBuild({ ...buildConfig })
    await sleep(100)

    // if (!hasServer) return

    console.log('\n' + ''.padEnd(60, '=') + '\n')
    process.env.WEBPACK_BUILD_STAGE = 'server'
    await superBuild({ ...buildConfig })
    await sleep(100)

    console.log('\n' + ''.padEnd(60, '=') + '\n')
    console.log(
        chalk.green('√ ')
        + chalk.yellowBright('[super/build] ')
        + __('build.complete', {
            time: (new Date()).toLocaleString()
        })
    )
}

run()
