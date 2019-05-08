const fs = require('fs-extra')
const path = require('path')
const validate = require('./validate-dist')
const getCwd = require('koot/utils/get-cwd')

/**
 * 处理打包路径。确保目标路径存在。以下内容写入环境变量
 *   - KOOT_DIST_DIR - 打包路径相对于项目根目录的相对路径
 *
 * @async
 * @param {String} dist 
 * @returns {String} 绝对路径
 */
module.exports = async (dist = '') => {
    // 如果为相对路径，转为绝对路径
    // if (dist.substr(0, 1) === '.') dist = path.resolve(getCwd(), dist)
    dist = await validate(dist)

    // 将打包目录存入环境变量
    // 在打包时，会使用 DefinePlugin 插件将该值赋值到 __DIST__ 全部变量中，以供项目内代码使用
    // process.env.KOOT_DIST_DIR = dist
    process.env.KOOT_DIST_DIR = path.relative(getCwd(), dist)

    // 确保打包目录存在
    await fs.ensureDir(dist)

    return dist
}
