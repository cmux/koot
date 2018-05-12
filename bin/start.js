#!/usr/bin/env node

const path = require('path')
const program = require('commander')
const npmRunScript = require('npm-run-script')
const chalk = require('chalk')
const sleep = require('../utils/sleep')
const readBuildConfigFile = require('../utils/read-build-config-file')
const spinner = require('../utils/spinner')
const __ = require('../utils/translate')

program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]')
    .option('--no-build', 'Don\'t build')
    .option('--pm2', 'Start with pm2')
    .parse(process.argv)

const run = async () => {
    // 读取构建配置
    const { dist } = await readBuildConfigFile()
    const building = spinner(chalk.yellowBright('[super/build] ') + __('build.building'))

    // 打包
    await new Promise((resolve, reject) => {
        const child = npmRunScript(
            `super-build`, {
                stdio: 'ignore'
            }
        )
        child.once('error', (error) => {
            console.trace(error)
            process.exit(1)
            reject(error)
        })
        child.once('exit', (exitCode) => {
            // console.trace('exit in', exitCode)
            resolve(exitCode)
            // process.exit(exitCode)
        })
    })

    building.succeed()
    await sleep(100)

    // 运行
    const cmd = `node ${path.resolve(dist, 'server/index.js').replace(/\\/g, '/')}`
    await new Promise((resolve, reject) => {
        const child = npmRunScript(cmd, {})
        child.once('error', (error) => {
            console.trace(error)
            process.exit(1)
            reject(error)
        })
        child.once('exit', (exitCode) => {
            // console.trace('exit in', exitCode)
            resolve(exitCode)
            // process.exit(exitCode)
        })
    })
}

run()
