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
const { keyFileProjectConfigTemp } = require('../defaults/before-build')

const {
    filenameWebpackDevServerPortTemp
} = require('../defaults/before-build')

const __ = require('../utils/translate')
const sleep = require('../utils/sleep')
const getPort = require('../utils/get-port')
// const spinner = require('../utils/spinner')
// const readBuildConfigFile = require('../utils/read-build-config-file')
const getAppType = require('../utils/get-app-type')
const setEnvFromCommand = require('../utils/set-env-from-command')
const getChunkmapPath = require('../utils/get-chunkmap-path')
const initNodeEnv = require('../utils/init-node-env')
const getCwd = require('../utils/get-cwd')
const getPathnameDevServerStart = require('../utils/get-pathname-dev-server-start')
// const terminate = require('../utils/terminate')
const removeTempProjectConfig = require('../libs/remove-temp-project-config')
const validateConfig = require('../libs/validate-config')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('-g, --global', 'Connect to global PM2')
    .option('--stage <stage>', 'Set STAGE')
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .option('--no-open', 'Don\'t open browser automatically')
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

    // 清除所有临时配置文件
    await removeTempProjectConfig()

    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f')

    const {
        client, server,
        stage: _stage,
        config,
        type,
        global = false,
        open = true,
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
    // const { dist, port } = await readBuildConfigFile()
    const {
        dist,
        port,
        [keyFileProjectConfigTemp]: fileProjectConfigTemp
    } = await validateConfig()
    const appType = await getAppType()
    const cwd = getCwd()
    const packageInfo = await fs.readJson(path.resolve(cwd, 'package.json'))
    const {
        name
    } = packageInfo

    // 如果有临时项目配置文件，更改环境变量
    if (fileProjectConfigTemp) {
        process.env.KOOT_PROJECT_CONFIG_PATHNAME = fileProjectConfigTemp
    }

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
        const removeListeners = () => {
            process.removeListener('exit', exitHandler)
            process.removeListener('SIGINT', exitHandler)
            process.removeListener('SIGUSR1', exitHandler)
            process.removeListener('SIGUSR2', exitHandler)
            process.removeListener('uncaughtException', exitHandler)
        }
        const exitHandler = async (/*options, err*/) => {
            await removeTempProjectConfig()
            if (Array.isArray(processes) && processes.length) {
                if (waitingSpinner) waitingSpinner.stop()
                await sleep(300)
                process.stdout.write('\x1B[2J\x1B[0f')
                console.log(chalk.redBright('Waiting for killing processes...'))
                for (let process of processes) {
                    await new Promise((resolve, reject) => {
                        // console.log(process)
                        pm2.delete(process.name, (err, proc) => {
                            // console.log('err', err)
                            // console.log('proc', proc)
                            if (Array.isArray(proc) && proc.every(p => p.status === 'stopped'))
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
                    removeListeners()
                    console.log('Press CTRL+C again to exit.')
                    // process.kill(process.pid)
                    process.exit(1)
                } catch (e) {
                    console.log(e)
                }
            } else {
                removeListeners()
                // 清空 log
                process.stdout.write('\x1B[2J\x1B[0f')
                console.log('Press CTRL+C again to exit.')
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
        const pathLogOut = path.resolve(cwd, `logs/dev/${stage}.log`)
        const pathLogErr = path.resolve(cwd, `logs/dev/${stage}-error.log`)
        if (fs.existsSync(pathLogOut)) await fs.remove(pathLogOut)
        if (fs.existsSync(pathLogErr)) await fs.remove(pathLogErr)
        await fs.ensureFile(pathLogOut)
        await fs.ensureFile(pathLogErr)
        const config = {
            name: `dev-${stage}-${name}`,
            script: path.resolve(__dirname, './build.js'),
            args: `--stage ${stage} --env dev`,
            cwd: cwd,
            output: pathLogOut,
            error: pathLogErr,
            autorestart: false,
        }
        if (stage === 'run') {
            Object.assign(config, {
                script: pathServerJS,
                watch: [pathServerJS],
                watch_options: {
                    usePolling: true,
                },
                // autorestart: true,
            })
            delete config.args
            // console.log(config)
            // await fs.writeJson(
            //     path.resolve(__dirname, '../1.json'),
            //     config,
            //     {
            //         spaces: 4
            //     }
            // )
        }
        // console.log(config)
        // processes.push(config.name)
        pm2.start(
            config,
            (err, proc) => {
                // console.log(err)
                if (err) return reject(err)
                processes.push({
                    ...proc,
                    name: config.name,
                })
                // console.log(JSON.stringify(proc))
                // fs.writeJsonSync(
                //     path.resolve(__dirname, '../2.json'),
                //     proc,
                //     {
                //         spaces: 4
                //     }
                // )
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

        // 移除临时文件
        await fs.remove(path.resolve(dist, filenameWebpackDevServerPortTemp))

        // waitingSpinner.stop()
        // waitingSpinner = undefined
        npmRunScript(`pm2 logs`)

        if (open)
            return opn(`http://localhost:${process.env.SERVER_PORT}/`)
    })
}

run()
