const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const download = require('download-git-repo')
const chalk = require('chalk')

const spinner = require('../utils/spinner')

const { dir, projects } = require('./projects')

/**
 * 准备测试项目
 */
module.exports = async () => {
    console.log(chalk.cyanBright('正在准备测试项目代码库'))

    await fs.ensureDir(dir)

    for (let project of projects) {
        await prepare(project)
        // await copyCurrentKoot(project)
    }

    return true
}

const prepare = async (project = {}) => {
    const {
        name,
        github,
    } = project

    const dest = path.resolve(dir, name)

    let needDownload = false

    if (fs.existsSync(dest)) {
        // 判断目录是否过旧
        const {
            ctimeMs
        } = await fs.lstat(dest)
        if (Date.now() - ctimeMs > 10 * 24 * 60 * 60 * 1000) {
            needDownload = true
            const waitingRemoving = spinner(`${name} - 清空中...`)
            await fs.remove(dest)
            waitingRemoving.stop()
        }
    } else {
        needDownload = true
    }

    if (needDownload) {
        await fs.ensureDir(dest)

        const waitingDownloading = spinner(`${name} - 下载中...`)
        await new Promise((resolve, reject) => {
            download(
                github,
                dest,
                err => {
                    if (err) return reject(err)
                    waitingDownloading.stop()
                    resolve()
                }
            )
        }).catch(err => {
            waitingInstalling.fail()
            console.error(err)
        })
    }

    { // 修改 package.json
        const pathPackage = path.resolve(dest, 'package.json')
        const p = await fs.readJson(pathPackage)
        const pSelf = await fs.readJson(path.resolve(__dirname, '../package.json'))
        p.dependencies.koot = 'file:../../'
        // console.log(pSelf.dependencies)
        // console.log(Object.keys(pSelf.dependencies))
        p.devDependencies = {}
        const keys = Object.keys(pSelf.dependencies)
            .filter(key => !(key in p.dependencies))
        for (let key of keys) {
            p.devDependencies[key] = pSelf.dependencies[key]
        }
        // console.log(p)
        await fs.writeJson(pathPackage, p, {
            spaces: 4
        })
    }

    const waitingInstalling = spinner(`${name} - 安装中...`)
    const { stdout, stderr } = await exec(
        'npm install --no-save',
        {
            cwd: dest,
        }
    )
    if (!stderr) {
        waitingInstalling.fail()
        console.error(stderr)
        return
    } else {
        waitingInstalling.stop()
    }

    spinner(`${name}`).succeed()
}

// const copyCurrentKoot = async (project = {}) => {
//     const {
//         name,
//         github,
//     } = project

//     const dest = path.resolve(dir, name)
//     const dirKoot = path.resolve(__dirname, '../')

//     const blacklist = [
//         'node_modules',
//         'test',
//     ]

//     const dirs = (await fs.readdir(dirKoot))
//         .filter(filename => !blacklist.includes(filename))
//         .filter(filename => !/^\./gi.test(filename))
//         .filter(filename => {
//             const stat = fs.lstatSync(path.resolve(dirKoot, filename))
//             return stat.isDirectory()
//         })

//     for (let dir of dirs) {
//         const from = path.resolve(dirKoot, dir)
//         const to = path.resolve(dest, 'node_modules/koot', dir)
//         await fs.copy(from, to, {
//             overwrite: true,
//             preserveTimestamps: true,
//         })
//     }
// }
