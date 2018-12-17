/**
 * 检查当前项目是否开启多语言支持
 * @returns {Boolean}
 */
const isI18nEnabled = () => {
    if (!JSON.parse(process.env.KOOT_I18N))
        return false
    return true
}
module.exports = isI18nEnabled
