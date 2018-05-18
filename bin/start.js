#!/usr/bin/env node

// const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const npmRunScript = require('npm-run-script')
const chalk = require('chalk')
const opn = require('opn')
const sleep = require('../utils/sleep')
const readBuildConfigFile = require('../utils/read-build-config-file')
const spinner = require('../utils/spinner')
const setEnvFromCommand = require('../utils/set-env-from-command')
const __ = require('../utils/translate')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('--no-build', 'Don\'t build')
    // .option('--pm2', 'Start with pm2')
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .parse(process.argv)

const run = async () => {
    const {
        build,
        config,
        type,
    } = program

    setEnvFromCommand({
        config, type
    })

    // 读取构建配置
    const {
        dist,
        // server,
    } = await readBuildConfigFile()

    // 打包
    if (build) {
        const building = spinner(chalk.yellowBright('[super/build] ') + __('build.building'))
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
    }

    // if (!server) {
    //     // console.log(chalk.red('× '))
    //     opn(path.resolve(dist, 'public/index.html'))
    //     return
    // }

    // 运行服务器
    const pathServerJS = path.resolve(dist, 'server/index.js')
    // if (pm2) {
    //     // PM2 方式
    //     console.log('--- pm2 ---')
    //     const pm2 = require('pm2')
    //     const packageInfo = await fs.readJson(path.resolve(process.cwd(), 'package.json'))
    //     const name = `${packageInfo.name}-server`
    //     // const cmd = `pm2`
    //     //     + ` pm2.json --only ${name}`
    //     pm2.start(pathServerJS, {
    //         name,
    //         "script": pathServerJS,
    //         "max_memory_restart": "300M",
    //         "instances": 1,
    //         "exec_mode": "cluster",
    //         "out_file": path.resolve(process.cwd(), "logs/dev/server.log"),
    //         "error_file": path.resolve(process.cwd(), "logs/dev/server-error.log")
    //     })
    // } else {
    // 正常方式
    const cmd = `node ${pathServerJS.replace(/\\/g, '/')}`
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
    // }

}

run()
