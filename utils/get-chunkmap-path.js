const path = require('path')
const getDistPath = require('./get-dist-path')

/**
 * 获取打包文件对应表 (chunkmap) 的文件路径
 * @param {string} [dist] 打包结果目录，默认为项目指定的路径
 * @returns {string}
 */
module.exports = (dist = getDistPath()) => (
    path.resolve(dist, '.public-chunkmap.json')
)
