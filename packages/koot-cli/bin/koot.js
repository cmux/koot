#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const semver = require('semver')

const vars = require('../lib/vars')
const getLocales = require('../lib/get-locales')
const spinner = require('../lib/spinner')
const _ = require('../lib/translate')

const stepCheckUpdate = require('../steps/check-update')
const stepCreate = require('../steps/create')
const stepUpgrade = require('../steps/upgrade')

const run = async () => {
    vars.locales = await getLocales()

    console.log('')
    console.log(chalk.cyanBright(_('welcome')))

    await stepCheckUpdate()

    const cwd = process.cwd()
    const pathnamePackageJson = path.resolve(cwd, 'package.json')
    const p = fs.existsSync(pathnamePackageJson)
        ? await fs.readJson(pathnamePackageJson)
        : {}
    const { dependencies = {} } = p

    if (typeof dependencies['super-project'] === 'string') {
        const { lowestSuperProjectVersion } = vars
        const versionSuper = dependencies['super-project']

        if (!semver.valid(versionSuper))
            return spinner(_(`upgrade_error:super-project version invalid`)).fail()

        const version = semver.valid(semver.coerce(versionSuper))
        if (semver.satisfies(version, `<${lowestSuperProjectVersion}`))
            return spinner(_(`upgrade_error:super-project version too low`)).fail()

        const confirm = await inquirer.prompt({
            type: 'list',
            name: 'value',
            message: _('welcome_exist_current_super_project'),
            choices: [
                {
                    name: _('ok'),
                    value: true
                },
                {
                    name: _('cancel'),
                    value: false
                },
            ],
            default: true,
        })
        if (!confirm.value)
            return
        return await stepUpgrade({
            showWelcome: false,
            needConfirm: false,
        })
    }

    if (typeof dependencies.koot === 'string') {
        /*
        如果当前目录的项目是 Koot.js 项目，检查 Koot.js 版本，然后提供以下选项
            升级（koot-upgrade，当 Koot.js 有新版本时）
            进入开发环境（koot-dev）
            打包分析（koot-analyze）
            打包正式版本（koot-build）
            打包正式版本并开启服务器（koot-start）
        */
        const next = await inquirer.prompt({
            type: 'list',
            name: 'value',
            message: _('welcome_exist_select'),
            choices: [
                'dev',
                'analyze',
                'build',
                'start',
                // 'upgrade'
            ].map(key => ({
                name: chalk.yellow(`koot-${key}`)
                    // + chalk.reset(' ')
                    + ' '
                    + _(`welcome_exist_select_${key}`),
                value: key
            })).concat({
                name: _(`welcome_exist_select_upgrade`),
                value: 'upgrade'
            }),
            default: 'dev'
        })
        switch (next.value) {
            case 'upgrade': {
                return await stepUpgrade({
                    showWelcome: false,
                    needConfirm: true,
                })
            }
            default: {
                require(path.resolve(
                    cwd,
                    `node_modules/koot/bin/${next.value}`
                ))
                // console.log(npm)
                // console.log(npm.bin)
                // const child = npmRunScript(`koot-${next.value}`, {})
                // child.once('error', (error) => {
                //     console.trace(error)
                //     process.exit(1)
                // });
                // child.once('exit', (exitCode) => {
                //     console.trace('exit in', exitCode)
                //     process.exit(exitCode)
                // })
            }
        }
    } else {
        /*
        如果当前目录的项目不是 Koot.js 项目，自动运行 koot-create
        */
        spinner(_('about_to_create_new_project')).warn()
        await stepCreate({
            showWelcome: false
        })
    }
}

run()
