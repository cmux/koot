
const defaults = require('../../../defaults/pwa')

/**
 * 处理 PWA 配置
 * @async
 * @param {*} pwa
 * @return {Boolean|Object}
 */
module.exports = async (pwa) => {
    if (pwa === true || typeof pwa === 'undefined')
        return {}

    if (typeof pwa === 'object') {
        pwa = Object.assign({}, defaults, pwa)
        process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(pwa.auto)
        process.env.KOOT_PWA_PATHNAME = JSON.stringify(pwa.pathname)
        return pwa
    }

    process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(false)
    return false
}
