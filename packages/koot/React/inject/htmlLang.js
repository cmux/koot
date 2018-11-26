/**
 * 注入: html 标签上的 lang 属性
 * @param {String} localeId 当前语种 ID
 * @returns {String}
 */
module.exports = (localeId) => localeId ? ` lang="${localeId}"` : ''
