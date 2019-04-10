const fs = require('fs-extra')

const getDirTemp = require('../libs/get-dir-tmp')

/**
 * 所有命令启动前
 * @async
 * @param {Object} [options={}]
 * @param {Boolean} [options.kootDev=false]
 * @void
 */
module.exports = async (options = {}) => {

    const {
        kootDev = false
    } = options

    // 清理临时目录
    if (!kootDev && typeof process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME !== 'string')
        await fs.remove(getDirTemp())

}
