const { chunkNameClientRunFirst } = require('../../defaults/before-build')
const readClientFile = require('../../utils/read-client-file')
const getClientFilePath = require('../../utils/get-client-file-path')

/**
 * 注入: meta 标签 HTML 代码
 * @param {Object} options
 * @param {String} [options.metaHtml]
 * @param {String} [options.localeId]
 * @param {Object} [options.compilation]
 * @returns {String}
 */
module.exports = ({ metaHtml = '', localeId, compilation }) => {

    let r = getClientRunFirstJS(localeId, compilation)

    if (typeof __KOOT_INJECT_METAS_START__ === 'undefined') {
        const {
            __KOOT_INJECT_METAS_START__,
            __KOOT_INJECT_METAS_END__,
        } = require('../../defaults/defines')
        r += `<!--${__KOOT_INJECT_METAS_START__}-->${metaHtml}<!--${__KOOT_INJECT_METAS_END__}-->`
    } else {
        r += `<!--${__KOOT_INJECT_METAS_START__}-->${metaHtml}<!--${__KOOT_INJECT_METAS_END__}-->`
    }

    return r
}

/**
 * 客户端预先执行 JS 的代码
 * @param {*} localeId 
 * @param {*} compilation 
 * @returns {String}
 */
const getClientRunFirstJS = (localeId, compilation) => {
    const filename = `${chunkNameClientRunFirst}.js`

    if (process.env.WEBPACK_BUILD_ENV === 'dev' && process.env.WEBPACK_BUILD_TYPE !== 'spa')
        return `<script type="text/javascript" src="${getClientFilePath(filename, localeId)}"></script>`

    return `<script type="text/javascript">${readClientFile(filename, localeId, compilation)}</script>`
}
