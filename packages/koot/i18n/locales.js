/* global __KOOT_SSR__:false */

import { localeId } from '../'

// 存储文本，按语言包名，如 locales.en、locales['zh-cn']
export const locales = (() => {
    if (__SERVER__) {
        if (typeof __KOOT_SSR__ === 'object')
            return __KOOT_SSR__.locales || {}
    }
    return {}
})()
export const setLocales = (locale = localeId, obj) => {
    if (__SERVER__) {
        if (typeof __KOOT_SSR__ === 'object')
            return
    }
    // console.log('set', locale, obj)
    locales[locale] = obj
}

export default locales
