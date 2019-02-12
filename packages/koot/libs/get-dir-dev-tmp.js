const path = require('path')
const getCwd = require('../utils/get-cwd')

/**
 * _仅针对开发环境_ 获取开发环境临时目录
 * @param {String} cwd
 * @returns {String}
 */
module.exports = (cwd = getCwd()) => path.resolve(
    cwd, 'logs/dev'
)
