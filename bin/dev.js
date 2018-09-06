#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const pm2 = require('pm2')
const chalk = require('chalk')
const npmRunScript = require('npm-run-script')
const opn = require('opn')

const checkFileUpdate = require('../libs/check-file-change')
const contentWaiting = require('../defaults/content-waiting')

const __ = require('../utils/translate')
const sleep = require('../utils/sleep')
const getPort = require('../utils/get-port')
// const spinner = require('../utils/spinner')
const readBuildConfigFile = require('../utils/read-build-config-file')
const getAppType = require('../utils/get-app-type')
const setEnvFromCommand = require('../utils/set-env-from-command')
const getChunkmapPath = require('../utils/get-chunkmap-path')
const initNodeEnv = require('../utils/init-node-env')
const getCwd = require('../utils/get-cwd')
const getPathnameDevServerStart = require('../utils/get-pathname-dev-server-start')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('--stage <stage>', 'Set STAGE')
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .option('--global', 'Connect to global PM2')
    .parse(process.argv)

/**
 * 进入开发环境
 * ****************************************************************************
 * 同构 (isomorphic)
 * 以 PM2 进程方式顺序执行以下流程
 *      1. 启动 webpack-dev-server (STAGE: client)
 *      2. 启动 webpack (watch mode) (STAGE: server)
 *      3. 运行 /server/index.js
 * ****************************************************************************
 * 单页面应用 (SPA)
 * 强制设置 STAGE 为 client，并启动 webpack-dev-server
 * ****************************************************************************
 */
const run = async () => {
    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f')

    const {
        client, server,
        stage: _stage,
        config,
        type,
        global = false,
    } = program

    initNodeEnv()
    setEnvFromCommand({
        config,
        type,
    })

    let stage = _stage ? _stage : (client ? 'client' : (server ? 'server' : false))

    // if (!stage) {
    //     console.log(
    //         chalk.redBright('× ')
    //         + __('dev.missing_stage', {
    //             example: 'koot-dev ' + chalk.green('--client'),
    //             indent: '  '
    //         })
    //     )
    //     return
    // }

    // 读取项目信息
    const appType = await getAppType()
    const packageInfo = await fs.readJson(path.resolve(getCwd(), 'package.json'))
    const { dist, port } = await readBuildConfigFile()
    const {
        name
    } = packageInfo

    // 如果为 SPA，强制设置 STAGE
    if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
        process.env.WEBPACK_BUILD_STAGE = 'client'
        stage = 'client'
    }

    // 如果配置中存在 port，修改环境变量
    if (typeof port !== 'undefined')
        process.env.SERVER_PORT = getPort(port, 'dev')

    // 如果设置了 stage，仅运行该 stage
    if (stage) {
        const cmd = `koot-build --stage ${stage} --env dev`
        const child = npmRunScript(cmd, {})
        child.once('error', (error) => {
            console.trace(error)
            process.exit(1)
        })
        child.once('exit', (/*exitCode*/) => {
            // console.trace('exit in', exitCode)
            // process.exit(exitCode)
        })
        return
    }

    // 没有设置 STAGE，开始 PM2 进程
    let waitingSpinner = false
    // spinner(
    //     chalk.yellowBright('[koot/build] ')
    //     + __('build.build_start', {
    //         type: chalk.cyanBright(appType),
    //         stage: chalk.green('client'),
    //         env: chalk.green('dev'),
    //     })
    // )

    const processes = []
    const pathChunkmap = getChunkmapPath(dist)
    const pathServerJS = path.resolve(dist, 'server/index.js')
    const pathServerStartFlag = getPathnameDevServerStart()

    { // 在脚本进程关闭/结束时，同时关闭打开的 PM2 进程
        process.stdin.resume()
        const exitHandler = async (/*options, err*/) => {
            if (Array.isArray(processes) && processes.length) {
                if (waitingSpinner) waitingSpinner.stop()
                await sleep(300)
                process.stdout.write('\x1B[2J\x1B[0f')
                console.log(chalk.redBright('Waiting for closing processes...'))
                // console.log(processes)
                // const w = spinner('Waiting for closing processes...')
                // await Promise.all(processes.map(proc =>
                //     new Promise((resolve/*, reject*/) => {
                //         setTimeout(() => {
                //             processes.splice(processes.indexOf(proc), 1)
                //             resolve()
                //         }, 500)
                //         // console.log(proc)
                //         // pm2.stop(proc)
                //         pm2.delete(proc)
                //     })
                // ))
                // await Promise.all(processes.map(proc =>
                //     new Promise((resolve/*, reject*/) => {
                //         setTimeout(() => resolve(), 500)
                //         console.log(proc)
                //         // pm2.stop(proc)
                //         pm2.delete(proc)
                //     })
                // ))
                // console.log(JSON.stringify(processes))
                for (let process of processes) {
                    await new Promise((resolve, reject) => {
                        pm2.delete(process, (err, proc) => {
                            // console.log('err', err)
                            // console.log('proc', proc)
                            // for (let key of Object.keys(proc)) {
                            //     console.log(key, proc[key])
                            // }
                            if (typeof proc === 'object' && (proc.status === 'stopped' || !proc.status))
                                return resolve(proc)
                            if (err) return reject(err)
                            reject('stop failed')
                        })
                    })
                }
                pm2.disconnect()
                await sleep(300)
                // w.stop()
                try {
                    // console.log(process.pid)
                    process.exit(1)
                    // process.kill(process.pid)
                } catch (e) {
                    console.log(e)
                }
            } else {
                process.removeListener('exit', exitHandler)
                process.removeListener('SIGINT', exitHandler)
                process.removeListener('SIGUSR1', exitHandler)
                process.removeListener('SIGUSR2', exitHandler)
                process.removeListener('uncaughtException', exitHandler)
                // 清空 log
                process.stdout.write('\x1B[2J\x1B[0f')
                console.log('Press CTRL+C again to terminate.')
                process.exit(1)
            }
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

    // 根据 stage 开启 PM2 进程
    const start = (stage) => new Promise(async (resolve, reject) => {
        const pathLogOut = path.resolve(getCwd(), `logs/dev/${stage}.log`)
        const pathLogErr = path.resolve(getCwd(), `logs/dev/${stage}-error.log`)
        if (fs.existsSync(pathLogOut)) await fs.remove(pathLogOut)
        if (fs.existsSync(pathLogErr)) await fs.remove(pathLogErr)
        await fs.ensureFile(pathLogOut)
        await fs.ensureFile(pathLogErr)
        const config = {
            name: `dev-${stage}-${name}`,
            script: path.resolve(__dirname, './build.js'),
            args: `--stage ${stage} --env dev`,
            cwd: getCwd(),
            output: pathLogOut,
            error: pathLogErr,
            autorestart: false,
        }
        if (stage === 'run') {
            config.script = pathServerJS
            config.watch = true
            delete config.args
        }
        // console.log(config)
        processes.push(config.name)
        pm2.start(
            config,
            (err, proc) => {
                // console.log(err)
                if (err) return reject(err)
                // console.log(JSON.stringify(proc))
                resolve(proc)
            }
        )
    })

    // 连接 PM2
    // console.log('noDaemon', !global)
    pm2.connect(!global, async (err) => {
        if (err) {
            // console.error(err)
            process.exit(2)
        }

        console.log(
            `  `
            + chalk.yellowBright('[koot/build] ')
            + __('build.build_start', {
                type: chalk.cyanBright(appType),
                stage: chalk.green('client'),
                env: chalk.green('dev'),
            })
        )

        // 清空 chunkmap 文件
        await fs.ensureFile(pathChunkmap)
        await fs.writeFile(pathChunkmap, contentWaiting)

        // 清空 server 打包结果文件
        await fs.ensureFile(pathServerJS)
        await fs.writeFile(pathServerJS, contentWaiting)

        // 清空服务器启动成功标识文件
        await fs.ensureFile(pathServerStartFlag)
        await fs.writeFile(pathServerStartFlag, contentWaiting)

        // 启动 client webpack-dev-server
        await start('client')

        // 监视 chunkmap 文件，如果修改，进入下一步
        await checkFileUpdate(pathChunkmap, contentWaiting)
        // waitingSpinner.succeed()
        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[koot/build] ')
            + __('build.build_complete', {
                type: chalk.cyanBright(appType),
                stage: chalk.green('client'),
                env: chalk.green('dev'),
            })
        )

        // 启动 server webpack
        // waitingSpinner = spinner(
        //     chalk.yellowBright('[koot/build] ')
        //     + __('build.build_start', {
        //         type: chalk.cyanBright(appType),
        //         stage: chalk.green('server'),
        //         env: chalk.green('dev'),
        //     })
        // )
        console.log(
            `  `
            + chalk.yellowBright('[koot/build] ')
            + __('build.build_start', {
                type: chalk.cyanBright(appType),
                stage: chalk.green('server'),
                env: chalk.green('dev'),
            })
        )
        await start('server')

        // 监视 server.js 文件，如果修改，进入下一步
        await checkFileUpdate(pathServerJS, contentWaiting)
        // waitingSpinner.succeed()

        // 执行
        // waitingSpinner = spinner(
        //     chalk.yellowBright('[koot/build] ')
        //     + 'waiting...'
        // )
        await start('run')

        // 监视服务器启动标识文件，如果修改，进入下一步
        await checkFileUpdate(pathServerStartFlag, contentWaiting)
        await sleep(100)

        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[koot/build] ')
            + __('build.build_complete', {
                type: chalk.cyanBright(appType),
                stage: chalk.green('server'),
                env: chalk.green('dev'),
            })
        )

        // waitingSpinner.stop()
        // waitingSpinner = undefined
        npmRunScript(`pm2 logs`)
        opn(`http://localhost:${process.env.SERVER_PORT}/`)
    })
}

run()
