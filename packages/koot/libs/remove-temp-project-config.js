const fs = require('fs-extra')
const path = require('path')
const glob = require('glob-promise')

const {
    filenameProjectConfigTemp,
    // filenameDll, filenameDllManifest,
} = require('../defaults/before-build')
const getCwd = require('../utils/get-cwd')

/**
 * @async
 * 移除所有根目录下的临时项目配置文件
 */
module.exports = async (cwd = getCwd()/*, dist = process.env.KOOT_DIST_DIR*/) => {
    try {

        const files = await glob(path.resolve(cwd, filenameProjectConfigTemp), {
            dot: true
        })

        for (let file of files) {
            await fs.remove(file)
        }

    } catch (e) {

    }
}
