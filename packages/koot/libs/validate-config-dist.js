const path = require('path')
const getCwd = require('../utils/get-cwd')

/**
 * 生效配置: dist。以下内容写入环境变量
 *   - KOOT_DIST_DIR - 打包目标路径绝对路径名
 * @param {String} dist 打包目标路径名
 * @returns 绝对路径名
 */
module.exports = (dist) => {
    process.env.KOOT_DIST_DIR = path.resolve(getCwd(), dist)
    return process.env.KOOT_DIST_DIR
}
