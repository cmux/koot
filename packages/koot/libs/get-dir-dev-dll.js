const path = require('path')
const getDirDevTmp = require('./get-dir-dev-tmp')

/**
 * _仅针对开发环境_ 获取 DLL 文件存放路径
 * @param {String} cwd
 * @returns {String}
 */
module.exports = (cwd) => path.resolve(
    getDirDevTmp(cwd), 'dll', process.env.WEBPACK_BUILD_STAGE
)
