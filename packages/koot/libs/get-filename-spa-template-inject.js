const { filenameSPATemplateInjectJS } = require('../defaults/before-build')

/**
 * 获取文件名: SPA 模板注入 JS
 * @param {String} [localeId]
 * @returns {String}
 */
module.exports = localeId => {
    if (localeId)
        return filenameSPATemplateInjectJS.replace(/LOCALEID/, localeId)
    return filenameSPATemplateInjectJS.replace(/\.LOCALEID/, '')
}
