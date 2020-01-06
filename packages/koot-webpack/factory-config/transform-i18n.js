// const fs = require('fs-extra');
const path = require('path');
// const chalk = require('chalk')
const getCwd = require('koot/utils/get-cwd');

/**
 * 处理 i18n 配置。以下内容写入环境变量
 *   - KOOT_I18N - 不可用 (false) 或完整的配置数组
 *   - KOOT_I18N_TYPE - 类型
 *   - KOOT_I18N_LOCALES - 语言包内容
 *   - KOOT_I18N_COOKIE_KEY - 使用的 cookie 键值
 *   - KOOT_I18N_COOKIE_DOMAIN - cookie 的作用域
 * @async
 * @param {*} i18n
 * @return {Boolean|Object} 不可用 (false) 或完整配置数组
 */
module.exports = async ({ dist, i18n }) => {
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV
        // WEBPACK_BUILD_STAGE: STAGE
        // WEBPACK_ANALYZE,
        // SERVER_DOMAIN,
        // SERVER_PORT,
    } = process.env;

    // TODO:
    if (TYPE === 'spa') {
        // SPA：临时禁用
        i18n = false;
        process.env.KOOT_I18N = JSON.stringify(false);
        return i18n;
    }

    if (typeof i18n === 'object') {
        let type = (() => {
            if (TYPE === 'spa') return 'store';
            if (ENV === 'dev') return 'store';
            return 'default';
        })();
        let expr = '__';
        let locales;
        let cookieKey;
        let domain;
        let use;

        if (Array.isArray(i18n)) {
            locales = [...i18n];
        } else {
            type = i18n.type || type;
            expr = i18n.expr || expr;
            locales = [...(i18n.locales || [])];
            cookieKey = i18n.cookieKey || cookieKey;
            domain = i18n.domain || domain || undefined;
            use = i18n.use || 'query';
        }

        if (ENV === 'dev') type = 'store';
        if (type.toLowerCase() === 'redux') type = 'store';
        type = type.toLowerCase();

        locales.forEach(arr => {
            if (arr[2]) return;
            const file = path.resolve(getCwd(), arr[1]);
            arr[1] = {};
            /** 语言包在硬盘里的路径 */
            arr[2] = file;
            /** 针对服务器端：语言包在打包结果里的路径 */
            arr[3] = `./locales/` + arr[0] + path.extname(file);
        });

        process.env.KOOT_I18N = JSON.stringify(true);
        process.env.KOOT_I18N_TYPE = JSON.stringify(type);
        process.env.KOOT_I18N_LOCALES = JSON.stringify(locales);
        if (cookieKey) process.env.KOOT_I18N_COOKIE_KEY = cookieKey;
        if (domain) process.env.KOOT_I18N_COOKIE_DOMAIN = domain;
        process.env.KOOT_I18N_URL_USE = use;

        i18n = {
            type,
            expr,
            locales
        };

        return i18n;
    }

    i18n = false;
    process.env.KOOT_I18N = JSON.stringify(false);
    return i18n;
};
