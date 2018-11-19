const fs = require('fs-extra')
const path = require('path')

module.exports = async (dir = process.cwd(), version) => {
    const pathnamePackagejson = path.resolve(dir, 'package.json')
    const p = await fs.readJson(pathnamePackagejson)

    // 修改 package.json 的依赖项
    p.dependencies.koot = '^' + version
    await fs.writeJson(pathnamePackagejson, p, {
        spaces: 4
    })

    // console.log(version)

    return {
        files: [pathnamePackagejson]
    }
}
