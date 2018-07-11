const path = require('path')
const getDistPath = require('./get-dist-path')

/**
 * 获取 chunkmap 文件路径 
 * @param {string} dist 打包结果目录
 * @returns {string}
 */
module.exports = (dist = getDistPath()) => (
    path.resolve(dist, '.public-chunkmap.json')
)
