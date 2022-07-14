const defaultsServiceWorker = require('../../../defaults/service-worker');
const defaultsWebApp = require('../../../defaults/web-app');
const { keyConfigIcons } = require('../../../defaults/before-build');

const validateIcon = require('../validation/icon');

/**
 * 配置转换 - 兼容性处理 - ServiceWorker 和 PWA 相关
 * - pwa
 * - serviceWorker
 * @async
 * @param {Object} config
 * @void
 */
module.exports = async (config) => {
    // ========================================================================
    // 旧配置项处理: pwa
    // ========================================================================
    if (
        typeof config.pwa !== 'undefined' &&
        typeof config.serviceWorker === 'undefined'
    ) {
        config.serviceWorker = config.pwa;
    }
    delete config.pwa;

    // ========================================================================
    // 默认值处理: serviceWorker
    // 旧配置项处理: serviceWorker
    // ========================================================================
    if (typeof config.serviceWorker === 'object') {
        const {
            // 移除的项
            pathname,
            initialCacheAppend,
            initialCacheIgonre,

            // 可用项
            filename,
            include,
            exclude,
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
            defaultsServiceWorker,
            config.serviceWorker
        );
    } else if (config.serviceWorker === true) {
        config.serviceWorker = { ...defaultsServiceWorker };
    } else if (typeof config.serviceWorker === 'undefined') {
        config.serviceWorker = { ...defaultsServiceWorker };
    }

    // ========================================================================
    // 默认值处理: icon
    // ========================================================================
    if (typeof config.icon !== 'string' && typeof config.icon !== 'object')
        delete config.icon;
    else await validateIcon(config).catch((err) => console.warn(err.message));

    // ========================================================================
    // 默认值处理: webApp
    // ========================================================================
    if (typeof config[keyConfigIcons] !== 'object') {
        config.webApp = false;
    } else if (
        config.webApp === true ||
        typeof config.webApp === 'undefined' ||
        typeof config.webApp === 'object'
    ) {
        config.webApp = {
            ...defaultsWebApp,
            name: config.name,
            ...(config.webApp || {}),
        };

        if (!config.webApp.themeColor) {
            config.webApp.themeColor = config[keyConfigIcons].dominantColor;
        }
    }

    return config;
};
