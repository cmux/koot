#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const pm2 = require('pm2')
const chalk = require('chalk')
const npmRunScript = require('npm-run-script')

const __ = require('../utils/translate')
const sleep = require('../utils/sleep')

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
        const factoryConfig = (stage) => ({
            name: `dev-${stage}-${name}`,
            script: path.resolve(__dirname, '../bin/build'),
            args: `--stage ${stage} --env dev`,
            cwd: process.cwd(),
            output: path.resolve(process.cwd(), `logs/dev/${name}-${stage}.log`),
            error: path.resolve(process.cwd(), `logs/dev/${name}-${stage}-error.log`),
            autorestart: false,
        })
        pm2.connect(true, (err) => {
            if (err) {
                console.error(err)
                process.exit(2)
            }

            pm2.start(
                factoryConfig('client'),
                (err, apps) => {
                    console.log(err)
                    if (err) throw err
                }
            )

            pm2.start(
                factoryConfig('server'),
                (err, apps) => {
                    console.log(err)
                    if (err) throw err
                }
            )
        })
    }
}

run()
