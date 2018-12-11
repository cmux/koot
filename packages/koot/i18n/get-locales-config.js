let locales

/**
 * 获取 i18n 配置数组
 * @returns {Array}
 */
module.exports = () => {
    if (!Array.isArray(locales)) {
        if (JSON.parse(process.env.KOOT_I18N)) {
            locales = JSON.parse(process.env.KOOT_I18N_LOCALES) || []
        } else {
            locales = []
        }
    }

    return locales
}
