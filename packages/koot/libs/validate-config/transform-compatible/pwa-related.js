const defaults = require('../../../defaults/service-worker');

/**
 * 配置转换 - 兼容性处理 - ServiceWorker 和 PWA 相关
 * - pwa
 * - serviceWorker
 * @async
 * @param {Object} config
 * @void
 */
module.exports = async config => {
    if (
        typeof config.pwa !== 'undefined' &&
        typeof config.serviceWorker === 'undefined'
    ) {
        config.serviceWorker = config.pwa;
    }

    delete config.pwa;

    if (typeof config.serviceWorker === 'object') {
        const {
            // 移除的项
            pathname,
            initialCacheAppend,
            initialCacheIgonre,

            // 可用项
            filename,
            include,
            exclude
        } = config.serviceWorker;

        if (!!pathname && !filename) {
            config.serviceWorker.filename =
                pathname.substr(0, 1) === '/' ? pathname.substr(1) : pathname;
        }

        if (!!initialCacheAppend) {
            if (typeof include === 'undefined') {
                config.serviceWorker.include = [];
            } else if (!Array.isArray(include)) {
                config.serviceWorker.include = [include];
            }
            config.serviceWorker.include = config.serviceWorker.include.concat(
                initialCacheAppend
            );
        }

        if (!!initialCacheIgonre) {
            if (typeof exclude === 'undefined') {
                config.serviceWorker.exclude = [];
            } else if (!Array.isArray(exclude)) {
                config.serviceWorker.exclude = [exclude];
            }
            config.serviceWorker.exclude = config.serviceWorker.exclude.concat(
                initialCacheIgonre
            );
        }

        delete config.serviceWorker.pathname;
        delete config.serviceWorker.initialCacheAppend;
        delete config.serviceWorker.initialCacheIgonre;

        config.serviceWorker = Object.assign(
            {},
            defaults,
            config.serviceWorker
        );
    } else if (config.serviceWorker === true) {
        config.serviceWorker = { ...defaults };
    } else if (typeof config.serviceWorker === 'undefined') {
        config.serviceWorker = { ...defaults };
    }

    return config;
};
