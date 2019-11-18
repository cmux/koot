const defaults = require('koot/defaults/pwa');

/**
 * 处理 PWA 配置。以下内容写入环境变量
 *   - KOOT_PWA_AUTO_REGISTER - 是否自动注册
 *   - KOOT_PWA_PATHNAME - 模板 service-worker 文件的本地路径 (目前只有 SPA 使用)
 * @async
 * @param {*} pwa
 * @return {Boolean|Object} 不可用 (false) 或完整配置对象
 */
module.exports = async pwa => {
    if (pwa === true || typeof pwa === 'undefined') {
        pwa = Object.assign({}, defaults);
        process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(pwa.auto);
        process.env.KOOT_PWA_PATHNAME = JSON.stringify(
            pwa.pathname || (pwa.filename ? `/${pwa.filename}` : '')
        );
        return pwa;
    }

    if (typeof pwa === 'object') {
        pwa = Object.assign({}, defaults, pwa);
        process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(pwa.auto);
        process.env.KOOT_PWA_PATHNAME = JSON.stringify(
            pwa.pathname || (pwa.filename ? `/${pwa.filename}` : '')
        );
        return pwa;
    }

    process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(false);
    return false;
};
