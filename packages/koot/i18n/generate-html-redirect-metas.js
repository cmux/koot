const { use: defaultUse } = require('../defaults/i18n');
const { changeLocaleQueryKey } = require('../defaults/defines');

/**
 * 生成用以声明该页面其他语种 URL 的 meta 标签的 HTML 代码
 * @param {Object} options
 * @param {String} options.localeId 当前语种
 * @param {string[]} options.availableLocaleIds
 * @param {string} [options.use=query]
 * @param {*} [options.ctx]
 * @returns {String} HTML 代码
 */
const generateHtmlRedirectMetas = ({
    ctx = {},
    localeId = '',
    availableLocaleIds,
    use = defaultUse,
}) => {
    if (!Array.isArray(availableLocaleIds)) return '';
    if (!availableLocaleIds.length) return '';

    const {
        hrefTrue: href = '',
        originTrue: origin = '',
        query = {},
        querystring = '',
    } = ctx;
    const isUseRouter = use === 'router';

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
            } else {
                thisHref = (() => {
                    if (query[changeLocaleQueryKey] === '') {
                        return href.replace(
                            new RegExp(`${changeLocaleQueryKey}=`),
                            `${changeLocaleQueryKey}=${l}`
                        );
                    }
                    if (typeof query[changeLocaleQueryKey] === 'string')
                        return href.replace(
                            new RegExp(`${changeLocaleQueryKey}=[a-zA-Z-_]+`),
                            `${changeLocaleQueryKey}=${l}`
                        );
                    return (
                        href +
                        (querystring
                            ? `&`
                            : href.substr(href.length - 1) === '?'
                            ? ''
                            : `?`) +
                        `${changeLocaleQueryKey}=${l}`
                    );
                })();
            }

            if (process.env.WEBPACK_BUILD_ENV === 'dev')
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

module.exports = generateHtmlRedirectMetas;
