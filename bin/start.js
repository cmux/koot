#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const program = require('commander')
const npmRunScript = require('npm-run-script')
const chalk = require('chalk')
// const opn = require('opn')

const {
    keyFileProjectConfigTemp
} = require('../defaults/before-build')
const sleep = require('../utils/sleep')
// const readBuildConfigFile = require('../utils/read-build-config-file')
const spinner = require('../utils/spinner')
const setEnvFromCommand = require('../utils/set-env-from-command')
const validateConfig = require('../libs/validate-config')
const __ = require('../utils/translate')
// const getCwd = require('../utils/get-cwd')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('--no-build', 'Don\'t build')
    // .option('--pm2', 'Start with pm2')
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .option('--port <port>', 'Set server port')
    .parse(process.argv)

/**
 * 打包生产环境，并启动服务器（如果可用）
 */
const run = async () => {
    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f')

    const {
        build,
        config,
        type,
        port,
    } = program

    setEnvFromCommand({
        config, type, port
    })

    // 读取构建配置
    const {
        dist,
        // server,
        [keyFileProjectConfigTemp]: filenameProjectConfigTemp,
    } = await validateConfig()

    const afterBuild = async () => {
        // 删除过程中创建的临时文件
        const fileProjectConfigTemp = path.resolve(dist, filenameProjectConfigTemp)
        if (fs.existsSync(fileProjectConfigTemp))
            await fs.remove(filenameProjectConfigTemp)
    }

    // 打包
    if (build) {
        const building = spinner(chalk.yellowBright('[koot/build] ') + __('build.building'))
        const { /*stdout,*/ stderr } = await exec(
            `koot-build`, {
                env: {
                    KOOT_COMMAND_START: JSON.stringify(true)
                }
            }
        )
        // await new Promise((resolve, reject) => {
        //     const child = npmRunScript(
        //         `koot-build`, {
        //             // stdio: 'ignore',
        //             env: {
        //                 KOOT_COMMAND_START: JSON.stringify(true)
        //             }
        //         }
        //     )
        //     // child.stdin.pipe(process.stdin)
        //     // child.stdout.pipe(process.stdout)
        //     // child.stderr.pipe(process.stderr)
        //     // child.stderr.on('data', err => {
        //     //     console.trace(err)
        //     // })
        //     child.once('error', (error) => {
        //         console.trace(error)
        //         process.exit(1)
        //         reject(error)
        //     })
        //     child.once('exit', (exitCode) => {
        //         // console.trace('exit in', exitCode)
        //         resolve(exitCode)
        //         // process.exit(exitCode)
        //     })
        //     console.log(child.stderr)
        // })

        // 打包过程中遭遇错误
        if (stderr && stderr !== ' ') {
            await afterBuild()

            // 标记 spinner 为出错
            building.fail()

            // 打出错误报告
            console.log('')
            console.trace(stderr)

            // 终止流程
            return
        }
        building.succeed()
        await sleep(100)
    }

    // if (!server) {
    //     // console.log(chalk.redBright('× '))
    //     opn(path.resolve(dist, 'public/index.html'))
    //     return
    // }

    await afterBuild()

    // 运行服务器
    const pathServerJS = path.resolve(dist, 'server/index.js')
    // if (pm2) {
    //     // PM2 方式
    //     console.log('--- pm2 ---')
    //     const pm2 = require('pm2')
    //     const packageInfo = await fs.readJson(path.resolve(getCwd(), 'package.json'))
    //     const name = `${packageInfo.name}-server`
    //     // const cmd = `pm2`
    //     //     + ` pm2.json --only ${name}`
    //     pm2.start(pathServerJS, {
    //         name,
    //         "script": pathServerJS,
    //         "max_memory_restart": "300M",
    //         "instances": 1,
    //         "exec_mode": "cluster",
    //         "out_file": path.resolve(getCwd(), "logs/dev/server.log"),
    //         "error_file": path.resolve(getCwd(), "logs/dev/server-error.log")
    //     })
    // } else {
    // 正常方式
    const cmd = `node ${pathServerJS.replace(/\\/g, '/')}`
    const child = npmRunScript(cmd, {})
    await new Promise((resolve, reject) => {
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

    /*
    await new Promise((resolve, reject) => {
        console.log({
            'process.env': process.env
        })
        const cmd = `node ${pathServerJS.replace(/\\/g, '/')}`
        const child = spawn(
            'node',
            [`${pathServerJS.replace(/\\/g, '/')}`]
        )

        // child.stdin.pipe(process.stdin)
        child.stdout.pipe(process.stdout)
        // child.stderr.pipe(process.stderr)
        console.log(process.cwd())
        console.log(cmd)

        // const child = npmRunScript(cmd, {})
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
    */
    const exitHandler = (/*options, err*/) => {
        child.kill('SIGINT')
        process.exit(0)
    }

    // do something when app is closing
    process.on('exit', exitHandler);
    // catches ctrl+c event
    process.on('SIGINT', exitHandler);
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler);
    process.on('SIGUSR2', exitHandler);
    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler);
}

run()
