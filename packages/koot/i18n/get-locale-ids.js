const getLocalesConfig = require('./get-locales-config')

let localeIds

/**
 * 获取 i18n 语种列表
 * @returns {Array}
 */
module.exports = () => {
    if (!Array.isArray(localeIds)) {
        localeIds = getLocalesConfig()
        localeIds = localeIds.map(l => l[0])
    }

    return localeIds
}
