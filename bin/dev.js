#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const pm2 = require('pm2')
const chalk = require('chalk')
const npmRunScript = require('npm-run-script')
const opn = require('opn')

const __ = require('../utils/translate')
const sleep = require('../utils/sleep')
const getPort = require('../utils/get-port')
const spinner = require('../utils/spinner')
const readBuildConfigFile = require('../utils/read-build-config-file')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .parse(process.argv)

const run = async () => {
    const {
        client, server,
    } = program

    const stage = client ? 'client' : (server ? 'server' : false)

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
    const packageInfo = await fs.readJson(path.resolve(process.cwd(), 'package.json'))
    const {
        name
    } = packageInfo

    if (stage) {
        const cmd = `super-build --stage ${stage} --env dev`
        const child = npmRunScript(cmd, {})
        child.once('error', (error) => {
            console.trace(error)
            process.exit(1)
        })
        child.once('exit', (exitCode) => {
            // console.trace('exit in', exitCode)
            // process.exit(exitCode)
        })
    } else {
        // 开始PM2进程
        const processes = []
        const { dist, port } = await readBuildConfigFile()
        const pathServerJS = path.resolve(dist, 'server/index.js')
        const contentWaiting = '// WAITING FOR SERVER BUNDLING'

        const waiting = spinner('WAITING')

        { // 在脚本进程关闭/结束时，同时关闭打开的 PM2 进程
            process.stdin.resume()
            const exitHandler = async (options, err) => {
                // console.log(processes)
                Promise.all(processes.map(proc =>
                    new Promise((resolve, reject) => {
                        pm2.delete(proc, err => {
                            // if (err) return reject(err)
                            resolve()
                        })
                    })
                ))
                pm2.disconnect()
                process.exit()
                // if (options.cleanup) console.log('clean')
                // if (err) console.log(err.stack)
                // if (options.exit) process.exit()
            }
            // do something when app is closing
            process.on('exit', exitHandler.bind(null, { cleanup: true }));
            // catches ctrl+c event
            process.on('SIGINT', exitHandler.bind(null, { exit: true }));
            // catches "kill pid" (for example: nodemon restart)
            process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
            process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
            // catches uncaught exceptions
            process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
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

            const interval = setInterval(async () => {
                const content = await fs.readFile(pathServerJS, 'utf-8')
                if (content !== contentWaiting) {
                    waiting.stop()
                    clearInterval(interval)
                    await start('run')
                    await sleep(100)
                    npmRunScript(`pm2 logs`)
                    opn(`http://localhost:${getPort(port, 'dev')}/`)
                }
            }, 500)
        })
    }
}

run()
