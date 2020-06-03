/**
 * 配置转换 - 兼容性处理 - Router 相关选项
 * - routes
 * - historyType
 * @async
 * @param {Object} config
 * @void
 */
module.exports = async (config) => {
    if (typeof config.routes !== 'undefined') {
        delete config.router;
    } else if (typeof config.router !== 'undefined') {
        config.routes = config.router;
        delete config.router;
    }

    if (
        !config.historyType &&
        typeof config.client === 'object' &&
        typeof config.client.historyType !== 'undefined'
    ) {
        config.historyType = config.client.historyType;
        delete config.client.historyType;
    }

    if (!config.historyType) {
        const type = process.env.KOOT_PROJECT_TYPE || config.type || '';
        config.historyType = /spa$/i.test(type) ? 'hash' : 'browser';
    }
};
