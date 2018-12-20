import { localeId } from '../'

// 存储文本，按语言包名，如 locales.en、locales['zh-cn']
export const locales = {}
export const setLocales = (locale = localeId, obj) => {
    // console.log('set', locale, obj)
    locales[locale] = obj
}

export default locales
