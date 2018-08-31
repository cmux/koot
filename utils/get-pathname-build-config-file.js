const path = require('path')
const getCwd = require('./get-cwd')

/**
 * 获取打包配置文件路径 (默认: /koot.build.js)
 * @returns {String}
 */
module.exports = () => typeof process.env.KOOT_BUILD_CONFIG_PATHNAME === 'string'
    ? process.env.KOOT_BUILD_CONFIG_PATHNAME
    : path.resolve(getCwd(), 'koot.build.js')
