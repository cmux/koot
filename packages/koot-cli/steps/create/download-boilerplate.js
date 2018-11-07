const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const download = require('download-git-repo')
const chalk = require('chalk')

const _ = require('../../lib/translate')
const spinner = require('../../lib/spinner')
const getConfigFile = require('../../lib/get-config-file')

const repo = 'github:cmux/koot-boilerplate'

/**
 * 下载模板
 * @async
 * @param {Object} project 项目信息
 * @param {String} dest 下载目标目录
 */
module.exports = async (project, dest) => {
    /** @type {String} 下载临时目录 */
    const tmp = path.resolve(os.tmpdir(), `sp-${Date.now()}`)
    const waitingDownloading = spinner(chalk.whiteBright(_('downloading_boilerplate')) + '...')
    await new Promise((resolve, reject) => {
        download(
            repo,
            tmp,
            err => {
                if (err) return reject(err)
                resolve()
            }
        )
    })
    waitingDownloading.stop()
    spinner(chalk.whiteBright(_('downloading_boilerplate'))).finish()

    // 更新配置文件内容，并复制到目标目录中
    const waitingCopying = spinner(chalk.whiteBright(_('copying_boilerplate')) + '...')
    const pathPackage = path.resolve(tmp, 'package.json')
    const p = await fs.readJson(pathPackage)
    p.version = "1.0.0"
    if (typeof project.name === 'string') {
        p.name = project.name
    }
    if (typeof project.description === 'string' && project.description !== '') {
        p.description = project.description
    } else {
        delete p.description
    }
    if (typeof project.author === 'object') {
        p.author = project.author
    } else {
        delete p.author
    }
    if (project.dist) {
        const regexDist = new RegExp(`dist:[ ]*['"](.+?)['"]`, "gm")

        const pathBuildConfig = await getConfigFile(tmp)
        const buildConfig = await fs.readFile(pathBuildConfig, 'utf-8')
        await fs.writeFile(
            pathBuildConfig,
            buildConfig.replace(regexDist, `dist: "${project.dist}"`)
                .replace(/([ ]*)name:[ ]*['"](.+?)['"]/g, `$1name: "${project.name}"`),
            'utf-8'
        )

        const pathBuildSpaConfig = path.resolve(tmp, 'koot.build.spa.js')
        if (fs.existsSync(pathBuildSpaConfig)) {
            const buildSpaConfig = await fs.readFile(pathBuildSpaConfig, 'utf-8')
            await fs.writeFile(
                pathBuildSpaConfig,
                buildSpaConfig.replace(regexDist, `dist: "${project.dist}-spa"`),
                'utf-8'
            )
        }
    }
    await fs.remove(path.resolve(tmp, 'package-lock.json'))
    await fs.writeJson(pathPackage, p, {
        spaces: 4
    })
    await fs.move(
        tmp,
        dest,
        { overwrite: true }
    )
    waitingCopying.stop()
    spinner(chalk.whiteBright(_('copying_boilerplate'))).finish()
}
