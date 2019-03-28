const path = require('path')
const getCwd = require('../utils/get-cwd')

/**
 * 获取打包过程临时目录
 * @param {String} [cwd]
 * @param {String} [type]
 * @returns {String} 如果提供 `type`，则返回对应类型的目录
 */
module.exports = (cwd = getCwd(), type = "") => path.resolve(
    cwd, 'logs/tmp', type ? `.${type}` : ''
)
