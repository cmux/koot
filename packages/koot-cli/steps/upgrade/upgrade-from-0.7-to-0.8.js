const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const glob = require('glob-promise')

const spinner = require('../../lib/spinner')
const _ = require('../../lib/translate')
const modifyPackageDependency = require('../../lib/modify-package-json/dependency')
const updateVersionInPackagejson = require('./update-version-in-packagejson')

module.exports = async (cwd = process.cwd(), prevVersion = '0.7.0') => {

    const msgUpgrading = require('./msg-upgrading')(prevVersion, '0.8.0')
    const spinnerUpgrading = spinner(msgUpgrading + '...')
    const filesChanged = ['package.json']

    // 添加依赖: autoprefixer
    await modifyPackageDependency(cwd, 'autoprefixer', undefined, 'dev')

    // 修改 ejs，删除所有 .css 相关的 content() 和 pathname()
    {
        const files = await glob(path.resolve(cwd, '**/*.ejs'))
        const regs = [
            /<style([^>]*)><%([-_=#% ]*)content\((['"])critical.css(['"])\)([-_=#% ]*)%><\/style>/,
            /<link([^>]*)href=(['"]){0,1}<%([-_=#% ]*)pathname\((['"])critical.css(['"])\)([-_=#% ]*)%>(['"]){0,1}([^>]*)>/
        ]
        for (const file of files) {
            for (const reg of regs) {
                const content = await fs.readFile(file, 'utf-8')
                if (reg.test(content)) {
                    await fs.writeFile(
                        file,
                        content.replace(reg, ''),
                        'utf-8'
                    )
                    filesChanged.push(path.relative(cwd, file))
                }
            }
        }
    }

    // 修改 babel.config.js: 删除 "react-hot-loader/babel"
    {
        const files = [
            'babel.config.js',
            '.babelrc'
        ]
        const toDelete = /(['"`])react-hot-loader\/babel(['"`])([,]*)/
        for (const filename of files) {
            const file = path.resolve(cwd, filename)
            if (fs.existsSync(file)) {
                const content = await fs.readFile(file, 'utf-8')
                if (toDelete.test(content)) {
                    await fs.writeFile(
                        file,
                        content.replace(toDelete, ''),
                        'utf-8'
                    )
                    filesChanged.push(filename)
                }
            }
        }
    }

    await updateVersionInPackagejson(cwd, '0.8.0')

    // 结束
    spinnerUpgrading.stop()
    spinner(msgUpgrading).finish()

    return {
        warn: chalk.yellowBright('koot 0.8.0')
            + chalk.reset(' ')
            + '\n'
            + _('upgrade_0.8.0_warning_1')
            + '\n'
            + _('upgrade_0.8.0_warning_2'),
        files: [...new Set(filesChanged)],
    }
}
