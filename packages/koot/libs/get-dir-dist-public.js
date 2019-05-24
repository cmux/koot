const path = require('path')

const getDirDistPublicFoldername = require('./get-dir-dist-public-foldername')

/**
 * 获取打包结果基础目录
 * 最终的打包目录是该目录下的 includes (默认情况)
 * @param {String} dist 打包结果目录
 * @param {Number} bundleVersionsKeep 
 * @returns {String}
 */
module.exports = (dist, bundleVersionsKeep) => {
    if (!result) {
        const base = path.resolve(dist, getDirDistPublicFoldername())
        if (process.env.KOOT_CLIENT_BUNDLE_SUBFOLDER) {
            // console.log({
            //     result,
            //     base,
            //     'process.env.KOOT_CLIENT_BUNDLE_SUBFOLDER': process.env.KOOT_CLIENT_BUNDLE_SUBFOLDER
            // })
            result = path.resolve(base, process.env.KOOT_CLIENT_BUNDLE_SUBFOLDER)
        } else if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
            result = base
        } else if (bundleVersionsKeep) {
            process.env.KOOT_CLIENT_BUNDLE_SUBFOLDER = `koot-${Date.now()}`
            result = path.resolve(base, process.env.KOOT_CLIENT_BUNDLE_SUBFOLDER)
        } else {
            result = base
        }
    }

    return result
}

let result
