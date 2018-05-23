import {
    setLocaleId,
    setLocales
} from '../index'

/**
 * 初始化
 * 
 * @param {string} [args.localeId] 当前语言ID。如过未提供，会尝试从初始 redux store 中查询
 * @param {Object} [args.locales] 当前语言包内容对象。如过未提供，会尝试从初始 redux store 中查询
 */
export default ({
    localeId,
    locales
}) => {
    if (!__CLIENT__) return

    if (typeof localeId === 'undefined' &&
        typeof __REDUX_STATE__ === 'object' &&
        typeof __REDUX_STATE__.localeId !== 'undefined'
    )
        localeId = __REDUX_STATE__.localeId
    if (typeof locales === 'undefined' &&
        typeof __REDUX_STATE__ === 'object' &&
        typeof __REDUX_STATE__.locales !== 'undefined'
    )
        locales = __REDUX_STATE__.locales

    if (typeof localeId === 'undefined' || typeof locales === 'undefined')
        return

    setLocaleId(localeId)
    setLocales(localeId, locales)

    if (localeId && typeof document !== 'undefined' && typeof document.cookie !== 'undefined') {
        const Cookies = require('js-cookie')
        const cookieOptions = {
            expires: 365
        }
        if (typeof process.env.SUPER_I18N_COOKIE_DOMAIN === 'string' &&
            process.env.SUPER_I18N_COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.SUPER_I18N_COOKIE_DOMAIN
        }
        Cookies.set(
            process.env.SUPER_I18N_COOKIE_KEY,
            localeId,
            cookieOptions
        )
    }
}
