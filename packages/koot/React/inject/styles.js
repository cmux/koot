import readClientFile from '../../utils/read-client-file'
import getClientFilePath from '../../utils/get-client-file-path'

/**
 * 注入: CSS 代码
 * @param {Boolean} needInjectCritical
 * @param {Object} injectCache
 * @param {Object} filemap
 * @param {String} stylesHtml
 * @returns {String}
 */
export default (needInjectCritical, injectCache, filemap, stylesHtml) => {

    if (typeof injectCache.styles === 'undefined') {
        injectCache.styles = (needInjectCritical && typeof filemap['critical.css'] === 'string')
            ? getCritical()
            : ''
    }

    return injectCache.styles + stylesHtml

}

const getCritical = () => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        return `<link id="__koot-critical-styles" media="all" rel="stylesheet" href="${getClientFilePath('critical.css')}" />`
    return `<style id="__koot-critical-styles" type="text/css">${readClientFile('critical.css')}</style>`
}
