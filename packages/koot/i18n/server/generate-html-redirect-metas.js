import { changeLocaleQueryKey } from '../../defaults/defines';
import availableLocaleIds from '../locale-ids';
import isI18nEnabled from '../../i18n/is-enabled';

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

    // let { href, origin } = ctx
    // if (typeof proxyRequestOrigin.protocol === 'string') {
    //     origin = origin.replace(/^http:\/\//, `${proxyRequestOrigin.protocol}://`)
    //     href = href.replace(/^http:\/\//, `${proxyRequestOrigin.protocol}://`)
    // }
    const { hrefTrue: href, originTrue: origin } = ctx;

    const isUseRouter = process.env.KOOT_I18N_URL_USE === 'router';

    let html = availableLocaleIds //getLocaleIds()
        .filter((thisLocaleId) => thisLocaleId !== localeId)
        .map((l) => {
            let thisHref = '';

            if (isUseRouter) {
                thisHref =
                    origin +
                    href
                        .replace(new RegExp(`^${origin}`), '')
                        .replace(new RegExp(`^${localeId}`), l)
                        .replace(new RegExp(`^/${localeId}`), '/' + l);
            } else if (process.env.KOOT_I18N_URL_USE === 'subdomain') {
                thisHref = href.replace(/:\/\/.+?\./, `://${l}.`);
            } else {
                thisHref = (() => {
                    if (ctx.query[changeLocaleQueryKey] === '') {
                        return href.replace(
                            new RegExp(`${changeLocaleQueryKey}=`),
                            `${changeLocaleQueryKey}=${l}`
                        );
                    }
                    if (typeof ctx.query[changeLocaleQueryKey] === 'string')
                        return href.replace(
                            new RegExp(`${changeLocaleQueryKey}=[a-zA-Z-_]+`),
                            `${changeLocaleQueryKey}=${l}`
                        );
                    return (
                        href +
                        (ctx.querystring
                            ? `&`
                            : href.substr(href.length - 1) === '?'
                            ? ''
                            : `?`) +
                        `${changeLocaleQueryKey}=${l}`
                    );
                })();
            }

            if (__DEV__)
                thisHref = thisHref
                    .replace('://localhost', '://127.0.0.1')
                    .replace(/^https:\/\//, 'http://');
            return `<link rel="alternate" hreflang="${l}" href="${thisHref}" />`;
        })
        .join('');

    if (isUseRouter) {
        html += `<base href="/${localeId}">`;
    }

    return html;
};

export default generateHtmlRedirectMetas;
