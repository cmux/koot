const path = require('path')

/**
 * 获取 chunkmap 文件路径 
 * @param {string} dist 打包结果目录
 * @returns {string}
 */
module.exports = (dist = process.env.SUPER_DIST_DIR) => (
    path.resolve(dist, '.public-chunkmap.json')
)
