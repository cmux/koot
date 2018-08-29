const fs = require('fs-extra')
const path = require('path')

/**
 * 处理打包路径
 * @async
 * @param {String} dist 
 * @returns {String} 绝对路径
 */
module.exports = async (dist = '') => {
    // 如果为相对路径，转为绝对路径
    if (dist.substr(0, 1) === '.') dist = path.resolve(process.cwd(), dist)

    // 将打包目录存入环境变量
    // 在打包时，会使用 DefinePlugin 插件将该值赋值到 __DIST__ 全部变量中，以供项目内代码使用
    // process.env.KOOT_DIST_DIR = dist
    process.env.KOOT_DIST_DIR = path.relative(process.cwd(), dist)

    // 确保打包目录存在
    await fs.ensureDir(dist)

    return dist
}
