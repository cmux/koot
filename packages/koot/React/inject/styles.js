const { chunkNameExtractCss } = require('../../defaults/before-build')
const readClientFile = require('../../utils/read-client-file')
const getClientFilePath = require('../../utils/get-client-file-path')

/**
 * 注入: CSS 代码
 * @param {Object} options
 * @param {Boolean} [options.needInjectCritical]
 * @param {Object} [options.injectCache]
 * @param {String} [options.stylesHtml]
 * @param {String} [options.localeId]
 * @param {Object} [options.filemap]
 * @param {String} [options.compilation]
 * @returns {String}
 */
module.exports = ({
    // needInjectCritical,
    injectCache,
    // filemap,
    stylesHtml,
    localeId,
    compilation,
}) => {

    if (typeof injectCache.styles === 'undefined') {
        injectCache.styles = getExtracted(localeId, compilation)
    }

    // if (needInjectCritical && typeof filemap['critical.css'] === 'string') {
    //     injectCache.styles += getCritical()
    // }

    return injectCache.styles + stylesHtml

}

// const getCritical = () => {
//     if (process.env.WEBPACK_BUILD_ENV === 'dev') {
//         return `<link id="__koot-critical-styles" media="all" rel="stylesheet" href="${getClientFilePath('critical.css')}" />`
//     }
//     return `<style id="__koot-critical-styles" type="text/css">${readClientFile('critical.css')}</style>`
// }

const getExtracted = (localeId, compilation) => {
    const filename = `${chunkNameExtractCss}.css`

    if (process.env.WEBPACK_BUILD_ENV === 'dev' && process.env.WEBPACK_BUILD_TYPE !== 'spa')
        return `<link id="__koot-extracted-styles" media="all" rel="stylesheet" href="${getClientFilePath(filename, localeId)}" />`

    const content = readClientFile(filename, localeId, compilation)
    // 如果内容大于 50k
    if (content.length > 50 * 1000)
        return `<link id="__koot-extracted-styles" media="all" rel="stylesheet" href="${getClientFilePath(filename, localeId)}" />`
    return `<style id="__koot-extracted-styles" type="text/css">${content}</style>`
}
