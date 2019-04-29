const fs = require('fs-extra')
const path = require('path')
const getCwd = require('../libs/require-koot')('utils/get-cwd')

/**
 * 处理打包路径
 * @async
 * @param {String} dist 
 * @returns {String} 绝对路径
 */
module.exports = async (dist = '') => {
    // 如果为相对路径，转为绝对路径
    if (dist.substr(0, 1) === '.')
        dist = path.resolve(getCwd(), dist)
    
    // 确保路径存在
    await fs.ensureDir(dist)

    return dist
}
