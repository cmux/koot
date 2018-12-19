const path = require('path')
const getCwd = require('./get-cwd')

/**
 * 获取项目配置文件路径 (默认: /koot.js)
 * @param {Boolean} server 是否获取服务器端配置
 * @returns {String}
 */
module.exports = (server = false) => {
    if (server) {
        return typeof process.env.KOOT_PROJECT_CONFIG_SERVER_PATHNAME === 'string'
            ? process.env.KOOT_PROJECT_CONFIG_SERVER_PATHNAME
            : path.resolve(getCwd(), 'koot.js')
    }
    return typeof process.env.KOOT_PROJECT_CONFIG_PATHNAME === 'string'
        ? process.env.KOOT_PROJECT_CONFIG_PATHNAME
        : path.resolve(getCwd(), 'koot.js')
}
