#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const pm2 = require('pm2')
// const chalk = require('chalk')
const npmRunScript = require('npm-run-script')
const opn = require('opn')

// const __ = require('../utils/translate')
const sleep = require('../utils/sleep')
const getPort = require('../utils/get-port')
const spinner = require('../utils/spinner')
const readBuildConfigFile = require('../utils/read-build-config-file')
const getAppType = require('../utils/get-app-type')
const setEnvFromCommand = require('../utils/set-env-from-command')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('--stage <stage>', 'Set STAGE')
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .parse(process.argv)

const run = async () => {
    const {
        client, server,
        stage: _stage,
        config,
        type,
    } = program

    setEnvFromCommand({
        config,
        type,
    })

    let stage = _stage ? _stage : (client ? 'client' : (server ? 'server' : false))

    // if (!stage) {
    //     console.log(
    //         chalk.red('× ')
    //         + __('dev.missing_stage', {
    //             example: 'super-dev ' + chalk.green('--client'),
    //             indent: '  '
    //         })
    //     )
    //     return
    // }

    // 读取项目信息
    await getAppType()
    const packageInfo = await fs.readJson(path.resolve(process.cwd(), 'package.json'))
    const { dist, port } = await readBuildConfigFile()
    const {
        name
    } = packageInfo

    if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
        process.env.WEBPACK_BUILD_STAGE = 'client'
        stage = 'client'
    }

    if (stage) {
        const cmd = `super-build --stage ${stage} --env dev`
        const child = npmRunScript(cmd, {})
        child.once('error', (error) => {
            console.trace(error)
            process.exit(1)
        })
        child.once('exit', (/*exitCode*/) => {
            // console.trace('exit in', exitCode)
            // process.exit(exitCode)
        })
    } else {
        // 开始PM2进程
        // 重制 cmd log
        process.stdout.write('\x1B[2J\x1B[0f')

        const processes = []
        const pathServerJS = path.resolve(dist, 'server/index.js')
        const contentWaiting = '// WAITING FOR SERVER BUNDLING'

        const waiting = spinner('WAITING')

        { // 在脚本进程关闭/结束时，同时关闭打开的 PM2 进程
            process.stdin.resume()
            const exitHandler = async (/*options, err*/) => {
                // console.log(processes)
                if (Array.isArray(processes) && processes.length) {
                    waiting.stop()
                    await sleep(300)
                    process.stdout.write('\x1B[2J\x1B[0f')
                    const w = spinner('WAITING FOR ENDING')
                    await Promise.all(processes.map(proc =>
                        new Promise((resolve/*, reject*/) => {
                            setTimeout(() => {
                                processes.splice(processes.indexOf(proc), 1)
                                resolve()
                            }, 500)
                            // console.log(proc)
                            pm2.delete(proc)
                        })
                    ))
                    await Promise.all(processes.map(proc =>
                        new Promise((resolve/*, reject*/) => {
                            setTimeout(() => resolve(), 500)
                            // console.log(proc)
                            pm2.delete(proc)
                        })
                    ))
                    // console.log(JSON.stringify(processes))
                    pm2.disconnect()
                    await sleep(300)
                    w.stop()
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
            const pathLogOut = path.resolve(process.cwd(), `logs/dev/${stage}.log`)
            const pathLogErr = path.resolve(process.cwd(), `logs/dev/${stage}-error.log`)
            if (fs.existsSync(pathLogOut)) await fs.remove(pathLogOut)
            if (fs.existsSync(pathLogErr)) await fs.remove(pathLogErr)
            const config = {
                name: `dev-${stage}-${name}`,
                script: path.resolve(__dirname, './build.js'),
                args: `--stage ${stage} --env dev`,
                cwd: process.cwd(),
                output: pathLogOut,
                error: pathLogErr,
                autorestart: false,
            }
            if (stage === 'run') {
                config.script = pathServerJS
                config.watch = true
                delete config.args
            }
            processes.push(config.name)
            pm2.start(
                config,
                (err, proc) => {
                    // console.log(err)
                    if (err) return reject(err)
                    resolve(proc)
                }
            )
        })

        // 连接 PM2
        pm2.connect(true, async (err) => {
            if (err) {
                // console.error(err)
                process.exit(2)
            }

            // 清空 server 打包结果文件
            await fs.ensureFile(pathServerJS)
            await fs.writeFile(pathServerJS, contentWaiting)

            await start('client')
            await sleep(100)
            await start('server')
            await sleep(100)

            const t = () => setTimeout(async () => {
                const content = await fs.readFile(pathServerJS, 'utf-8')
                if (content !== contentWaiting) {
                    // clearInterval(interval)
                    await start('run')
                    await sleep(2000)
                    waiting.stop()
                    npmRunScript(`pm2 logs`)
                    opn(`http://localhost:${getPort(port, 'dev')}/`)
                } else {
                    t()
                }
            }, 500)
            t()
        })
    }
}

run()
