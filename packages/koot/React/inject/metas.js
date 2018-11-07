/**
 * 注入: meta 标签 HTML 代码
 * @param {String} metaHtml
 * @returns {String}
 */
export default (metaHtml) =>
    `<!--${__KOOT_INJECT_METAS_START__}-->${metaHtml}<!--${__KOOT_INJECT_METAS_END__}-->`
