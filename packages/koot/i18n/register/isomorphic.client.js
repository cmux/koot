/* global __KOOT_SSR_STATE__:false */

import setCookie from '../set-cookie'

/**
 * 初始化
 * 
 * @param {string} [args.localeId] 当前语言ID。如过未提供，会尝试从初始 redux store 中查询
 */
export default ({
    localeId
}) => {
    if (!__CLIENT__) return

    if (typeof localeId === 'undefined' &&
        typeof __REDUX_STATE__ === 'object' &&
        typeof __REDUX_STATE__.localeId !== 'undefined'
    ) {
        if (
            typeof window.LocaleId !== 'undefined'
        )
            localeId = window.LocaleId
        else if (
            typeof __KOOT_SSR_STATE__ === 'object' &&
            typeof __KOOT_SSR_STATE__.localeId !== 'undefined'
        )
            localeId = __KOOT_SSR_STATE__.localeId
        else if (
            typeof __REDUX_STATE__ === 'object' &&
            typeof __REDUX_STATE__.localeId !== 'undefined'
        )
            localeId = __REDUX_STATE__.localeId
    }

    if (typeof localeId === 'undefined')
        return

    setCookie(localeId)
}
