const getPublic = require('./get-public-dir');

/**
 * 获取 service-worker 访问 URI
 * @param {String} [localeId] 如果提供，则会返回 [NAME].[localeId].js
 * @returns {String}
 */
module.exports = localeId => {
    if (typeof process.env.KOOT_PWA_PATHNAME !== 'string') return '';

    // 如果 localeId 是对象，表示 chunkmap
    if (typeof localeId === 'object') {
        const { 'service-worker': sw = [] } = localeId;
        if (sw.length) {
            const file = sw[0];
            const { '.public': p } = localeId;
            const regex = new RegExp(`^${p}`);
            const P = getPublic();
            if (regex.test(file)) return P + file.replace(regex, '');
            return P + file.replace(/^public\//, '');
        }
        return '';
    }

    const i18nType = JSON.parse(process.env.KOOT_I18N)
        ? JSON.parse(process.env.KOOT_I18N_TYPE)
        : undefined;

    const pwaPathname = JSON.parse(process.env.KOOT_PWA_PATHNAME);

    if (i18nType !== 'default') return pwaPathname;

    if (!localeId) return pwaPathname;

    const chunks = pwaPathname.split('.');
    chunks.splice(chunks.length - 1, 0, localeId);
    return chunks.join('.');
};
