#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
// const util = require('util')
// const exec = util.promisify(require('child_process').exec)
const { spawn } = require('child_process')

const program = require('commander')
const npmRunScript = require('npm-run-script')
const chalk = require('chalk')

const before = require('./_before')

const {
    filenameBuildFail,
} = require('../defaults/before-build')
const sleep = require('../utils/sleep')
// const readBuildConfigFile = require('../utils/read-build-config-file')
const spinner = require('../utils/spinner')
const setEnvFromCommand = require('../utils/set-env-from-command')
const getAppType = require('../utils/get-app-type')
const validateConfig = require('../libs/validate-config')
const validateConfigDist = require('../libs/validate-config-dist')
// const __ = require('../utils/translate')
// const getCwd = require('../utils/get-cwd')
// const emptyTempConfigDir = require('../libs/empty-temp-config-dir')
const getDirTemp = require('../libs/get-dir-tmp')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('--no-build', 'Don\'t build')
    // .option('--pm2', 'Start with pm2')
    .option('--dest <destination-path>', 'Set destination directory')
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .option('--port <port>', 'Set server port')
    .option('--koot-test', 'Koot test mode')
    .parse(process.argv)

/**
 * 打包生产环境，并启动服务器（如果可用）
 */
const run = async () => {
    // console.log('================')

    const {
        build,
        dest,
        config,
        type,
        port,
        kootTest = false
    } = program

    if (!kootTest)
        // 清空 log
        process.stdout.write('\x1B[2J\x1B[0f')

    setEnvFromCommand({
        config, type, port
    })

    process.env.KOOT_TEST_MODE = JSON.stringify(kootTest)

    await before(program)

    // 读取构建配置
    const kootConfig = await validateConfig()
    await getAppType()
    if (dest) kootConfig.dist = validateConfigDist(dest)
    const { dist } = kootConfig

    const afterBuild = async () => {
        // 清理临时目录
        await fs.remove(getDirTemp())
        // 删除过程中创建的临时文件
        // emptyTempConfigDir()
    }

    // 打包
    if (build) {
        // const building = spinner(chalk.yellowBright('[koot/build] ') + __('build.building'))
        const fileBuildFail = path.resolve(dist, filenameBuildFail)

        /** @type {String} build 命令的附加参数 */
        const buildCmdArgs = '--env prod'
            + (typeof dest === 'string' ? ` --dest ${dest}` : '')
            + (typeof config === 'string' ? ` --config ${config}` : '')
            + (typeof type === 'string' ? ` --type ${type}` : '')
            + (kootTest ? ` --koot-test` : '')

        let stderr = ''
        await new Promise(resolve => {
            const child = spawn(
                'koot-build',
                buildCmdArgs.split(' '),
                {
                    stdio: 'inherit',
                    shell: true,
                }
            )
            child.on('close', () => {
                resolve()
            })
            // child.on('error', (err) => {
            //     stderr = err
            //     resolve()
            // })
            // child.stderr.on('data', (data) => {
            //     console.log(`stderr: ${data}`);
            //     stderr += data
            // })
        })
        // const { stderr } = await exec(
        //     `koot-build ${buildCmdArgs}`, {
        //         env: {
        //             KOOT_COMMAND_START: JSON.stringify(true)
        //         }
        //     }
        // )
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
        if (
            fs.existsSync(fileBuildFail) &&
            stderr && stderr !== ' '
        ) {
            await afterBuild()

            // 标记 spinner 为出错
            // building.fail()

            // console.log(typeof stderr)

            // 打出错误报告
            console.log('')
            console.trace(stderr)

            // 终止流程
            return
        }
        // building.succeed()
        await sleep(100)
    }

    await afterBuild()

    // 运行服务器
    const pathServerJS = path.resolve(dist, 'server/index.js')

    if (!fs.existsSync(pathServerJS) || !fs.readFileSync(pathServerJS)) {
        console.log('\n\n')
        spinner(chalk.yellowBright('[koot/build]')).fail()
        return
    }
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
    // console.log('cmd', cmd)
    const child = npmRunScript(cmd, {})
    // console.log('child', child)
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
