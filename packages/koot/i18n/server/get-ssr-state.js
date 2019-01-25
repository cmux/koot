/* global __KOOT_SSR__:false */

/**
 * 返回多语言相关的 SSR 状态
 * @returns {Object}
 */
const getSSRState = () => {
    if (!__SERVER__) return {}
    if (__DEV__)
        return {
            localeId: global.__KOOT_SSR__.LocaleId,
            locales: JSON.parse(process.env.KOOT_I18N_TYPE) === 'redux'
                ? (global.__KOOT_SSR__.locales[global.__KOOT_SSR__.LocaleId] || {})
                : {}
        }

    if (typeof __KOOT_SSR__ !== 'object') return {}

    return {
        localeId: __KOOT_SSR__.LocaleId,
        locales: JSON.parse(process.env.KOOT_I18N_TYPE) === 'redux'
            ? (__KOOT_SSR__.locales[__KOOT_SSR__.LocaleId] || {})
            : {}
    }
}
export default getSSRState
