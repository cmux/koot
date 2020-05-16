import availableLocaleIds from '../locale-ids';
import isI18nEnabled from '../../i18n/is-enabled';

import gen from '../generate-html-redirect-metas';

/**
 * 生成用以声明该页面其他语种 URL 的 meta 标签的 HTML 代码
 * @param {Object} options
 * @param {Object} options.ctx
 * @param {Object} options.proxyRequestOrigin Koot 配置: server.proxyRequestOrigin
 * @param {String} options.localeId 当前语种
 * @returns {String} HTML 代码
 */
const generateHtmlRedirectMetas = ({
    ctx,
    localeId /*, proxyRequestOrigin*/,
}) => {
    if (!isI18nEnabled()) return '';

    return gen({
        localeId,
        availableLocaleIds,
        use: process.env.KOOT_I18N_URL_USE,
        ctx,
    });
};

export default generateHtmlRedirectMetas;
