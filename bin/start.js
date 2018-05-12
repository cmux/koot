#!/usr/bin/env node

const path = require('path')
const program = require('commander')
const npmRunScript = require('npm-run-script')
const sleep = require('../utils/sleep')
const readBuildConfigFile = require('../utils/read-build-config-file')

program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]')
    // .option('--stage [stage]', 'STAGE')
    // .option('--env [env]', 'ENV')
    .parse(process.argv)

const run = async () => {
    // 读取构建配置
    const { dist } = await readBuildConfigFile()

    // 打包
    const childBuild = npmRunScript(
        `super-build`, {
            // stdio: 'ignore'
        }
    )
    childBuild.once('error', (error) => {
        console.trace(error)
        process.exit(1)
    })
    childBuild.once('exit', (exitCode) => {
        console.trace('exit in', exitCode)
        process.exit(exitCode)
    })

    // 运行
    const childRun = npmRunScript(
        `node ${path.resolve(
            dist,
            'server/index.js'
        )}`, {
        }
    )// quiet...
    childRun.once('error', (error) => {
        console.trace(error)
        process.exit(1)
    })
    childRun.once('exit', (exitCode) => {
        console.trace('exit in', exitCode)
        process.exit(exitCode)
    })
}

run()
