#!/usr/bin/env node

const program = require('commander')
// const chalk = require('chalk')

// const __ = require('../utils/translate')
const readBuildConfigFile = require('../utils/read-build-config-file')
const setEnvFromCommand = require('../utils/set-env-from-command')
const initNodeEnv = require('../utils/init-node-env')

const kootBuild = require('../core/webpack/enter')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('--stage <stage>', 'Set STAGE')
    .option('--config <config-file-path>', 'Set config file pathname')
    .option('--type <project-type>', 'Set project type')
    .parse(process.argv)

const run = async () => {
    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f')

    const {
        client, server,
        stage: _stage,
        config,
        type,
    } = program

    initNodeEnv()
    // console.log(program)

    setEnvFromCommand({
        config,
        type,
    })

    const stage = _stage ||
        (client ? 'client' : undefined) ||
        (server ? 'server' : undefined) ||
        'client'

    process.env.WEBPACK_BUILD_STAGE = stage || 'client'
    process.env.WEBPACK_BUILD_ENV = 'prod'

    // 读取构建配置
    const buildConfig = await readBuildConfigFile()

    await kootBuild({
        analyze: true,
        ...buildConfig
    })

    console.log(' ')
}

run()
