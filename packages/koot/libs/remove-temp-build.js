const fs = require('fs-extra')
const path = require('path')

const {
    // filenameDll, filenameDllManifest,
    filenameWebpackDevServerPortTemp,
    filenameBuilding, filenameBuildFail,
} = require('../defaults/before-build')

const getDirDevTmp = require('../libs/get-dir-dev-tmp')
// const getDirDevDll = require('../libs/get-dir-dev-dll')

const getChunkmapPath = require('../utils/get-chunkmap-path')

/**
 * 清理打包过程中生成的临时文件
 * @async
 * @param {String} dist 
 */
module.exports = async (dist = process.env.KOOT_DIST_DIR) => {
    if (!dist) return

    const files = [
        getChunkmapPath(dist),
        // path.resolve(dist, filenameDll),
        // path.resolve(dist, `${filenameDll}.map`),
        // path.resolve(dist, filenameDllManifest),
        path.resolve(getDirDevTmp(), filenameWebpackDevServerPortTemp),
        path.resolve(dist, filenameBuilding),
        path.resolve(dist, filenameBuildFail),
    ]

    for (let file of files) {
        if (fs.existsSync(file))
            await fs.remove(file)
    }

}
