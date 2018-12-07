import { changeLocaleQueryKey } from '../../defaults/defines'
import getLocaleIds from '../get-locale-ids'

/**
 * 生成用以声明该页面其他语种 URL 的 meta 标签的 HTML 代码
 * @param {Object} options 
 * @param {Object} options.ctx 
 * @param {Object} options.proxyRequestOrigin Koot 配置: server.proxyRequestOrigin
 * @param {String} options.localeId 当前语种
 * @returns {String} HTML 代码
 */
const generateHtmlRedirectMetas = ({ ctx, proxyRequestOrigin, localeId }) => {
    if (!JSON.parse(process.env.KOOT_I18N))
        return ''

    let { href } = ctx
    if (typeof proxyRequestOrigin.protocol === 'string') {
        href = href.replace(/^http:\/\//, `${proxyRequestOrigin.protocol}://`)
    }

    const isUseRouter = process.env.KOOT_I18N_URL_USE === 'router'

    let html = getLocaleIds()
        .filter(thisLocaleId => thisLocaleId !== localeId)
        .map(l => {

            let thisHref = ''

            if (isUseRouter) {
                thisHref = ctx.origin
                    + ctx.href
                        .replace(new RegExp(`^${ctx.origin}`), '')
                        .replace(new RegExp(`^${localeId}`), l)
                        .replace(new RegExp(`^/${localeId}`), '/' + l)
            } else {
                thisHref = (typeof ctx.query[changeLocaleQueryKey] === 'string')
                    ? href.replace(
                        new RegExp(`${changeLocaleQueryKey}=[a-zA-Z-_]+`),
                        `${changeLocaleQueryKey}=${l}`
                    )
                    : href + (ctx.querystring ? `&` : (
                        href.substr(href.length - 1) === '?'
                            ? ''
                            : `?`
                    )) + `${changeLocaleQueryKey}=${l}`
            }

            if (__DEV__) thisHref = thisHref.replace('://localhost', '://127.0.0.1')
            return `<link rel="alternate" hreflang="${l}" href="${thisHref}" />`
        })
        .join('')

    if (isUseRouter) {
        html += `<base href="/${localeId}">`
    }

    return html
}

export default generateHtmlRedirectMetas
