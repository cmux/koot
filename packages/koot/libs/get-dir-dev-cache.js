const getDirDevTmp = require('./get-dir-dev-tmp')

/**
 * _仅针对开发环境_ 获取打包缓存结果文件存放路径
 * @param {String} cwd
 * @returns {String}
 */
module.exports = (cwd) => getDirDevTmp(cwd, 'cache')
