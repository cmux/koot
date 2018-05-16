import {
    availableLocales,
    setAvailableLocales,
    setLocales,
} from '../index'

/**
 * 初始化
 * 
 * @param {[string]} localeIds 项目可用的语言代码
 * @param {Object} locales locales 处理后的值
 */
export default ({
    localeIds,
    locales,
}) => {
    if (!__SERVER__) return
    if (availableLocales.length) return

    setAvailableLocales(localeIds)
    for (let key in locales) setLocales(key, locales[key])
}
