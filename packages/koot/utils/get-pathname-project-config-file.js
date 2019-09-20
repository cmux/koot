const path = require('path');
const getCwd = require('./get-cwd');

/**
 * 获取项目临时配置文件路径
 * - 临时配置文件为已转换的可无忧引用的配置文件，在流程开始前自动生成，在结束后自动删除
 * - 0.6 之前版本: 获取项目配置文件路径 (默认: /koot.js)
 * @param {Boolean} portion 是否获取部分配置
 * @returns {String}
 */
module.exports = (portion = false) => {
    if (portion === 'client') {
        return typeof process.env
            .KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME === 'string'
            ? process.env.KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME
            : path.resolve(getCwd(), 'koot.js');
    }
    if (portion) {
        return typeof process.env
            .KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME === 'string'
            ? process.env.KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME
            : path.resolve(getCwd(), 'koot.js');
    }
    return typeof process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME === 'string'
        ? process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME
        : path.resolve(getCwd(), 'koot.js');
};
