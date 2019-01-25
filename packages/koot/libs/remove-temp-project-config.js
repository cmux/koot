const getCwd = require('../utils/get-cwd')
const emptyTempConfigDir = require('./empty-temp-config-dir')

/**
 * @async
 * 移除所有根目录下的临时项目配置文件
 */
module.exports = async (cwd = getCwd()/*, dist = process.env.KOOT_DIST_DIR*/) => {
    try {

        emptyTempConfigDir(cwd)

    } catch (e) {

    }
}
