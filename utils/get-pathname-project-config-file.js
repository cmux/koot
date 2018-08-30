const path = require('path')
const getCwd = require('./get-cwd')

/**
 * 获取项目配置文件路径 (默认: /koot.js)
 * @returns {String}
 */
module.exports = () => typeof process.env.KOOT_PROJECT_CONFIG_PATHNAME === 'string'
    ? process.env.KOOT_PROJECT_CONFIG_PATHNAME
    : path.resolve(getCwd(), 'koot.js')
