const isI18nEnabled = require('./is-enabled')

let locales

/**
 * 获取 i18n 配置数组
 * @returns {Array}
 */
module.exports = () => {
    if (!Array.isArray(locales)) {
        if (isI18nEnabled()) {
            locales = JSON.parse(process.env.KOOT_I18N_LOCALES) || []
        } else {
            locales = []
        }
    }

    return locales
}
