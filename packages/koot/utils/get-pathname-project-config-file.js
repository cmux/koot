const path = require('path')
const getCwd = require('./get-cwd')

/**
 * 获取项目配置文件路径 (默认: /koot.js)
 * @param {Boolean} portion 是否获取部分配置
 * @returns {String}
 */
module.exports = (portion = false) => {
    if (portion) {
        return typeof process.env.KOOT_PROJECT_CONFIG_PORTION_PATHNAME === 'string'
            ? process.env.KOOT_PROJECT_CONFIG_PORTION_PATHNAME
            : path.resolve(getCwd(), 'koot.js')
    }
    return typeof process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME === 'string'
        ? process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME
        : path.resolve(getCwd(), 'koot.js')
}
