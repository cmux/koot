/**
 * 注入: meta 标签 HTML 代码
 * @param {String} metaHtml
 * @returns {String}
 */
module.exports = (metaHtml = '') => {
    if (typeof __KOOT_INJECT_METAS_START__ === 'undefined') {
        const {
            __KOOT_INJECT_METAS_START__,
            __KOOT_INJECT_METAS_END__,
        } = require('../../defaults/defines')
        return `<!--${__KOOT_INJECT_METAS_START__}-->${metaHtml}<!--${__KOOT_INJECT_METAS_END__}-->`
    }

    return `<!--${__KOOT_INJECT_METAS_START__}-->${metaHtml}<!--${__KOOT_INJECT_METAS_END__}-->`
}
