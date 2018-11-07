const fs = require('fs-extra')
const path = require('path')
const latestVersion = require('latest-version')
const semver = require('semver')

const spinner = require('../../lib/spinner')
const msgUpgrading = require('./msg-upgrading')

module.exports = async (dir = process.cwd(), version) => {
    const writeFile = true

    if (!version) {
        const waitingVersion = spinner('')
        version = await latestVersion('koot')
        waitingVersion.stop()
    }

    const pathnamePackagejson = path.resolve(dir, 'package.json')
    const p = await fs.readJson(pathnamePackagejson)

    const msg = msgUpgrading(semver.valid(semver.coerce(p.dependencies.koot)), version)
    const waiting = spinner(msg + '...')

    // 修改 package.json 的依赖项
    p.dependencies.koot = '^' + version
    if (writeFile)
        await fs.writeJson(pathnamePackagejson, p, {
            spaces: 4
        })

    waiting.stop()
    spinner(msg).finish()

    // console.log(version)

    return {
        files: [pathnamePackagejson]
    }
}
