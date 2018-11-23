const fs = require('fs-extra')
const path = require('path')

const { filenameDll } = require('../../defaults/before-build')
const { dll } = require('../../defaults/dev-request-uri')
const readClientFile = require('../../utils/read-client-file')
const getClientFilePath = require('../../utils/get-client-file-path')

/**
 * 注入: CSS 代码
 * @param {Boolean} needInjectCritical
 * @param {Object} injectCache
 * @param {Object} filemap
 * @param {String} stylesHtml
 * @returns {String}
 */
module.exports = (needInjectCritical, injectCache, filemap, stylesHtml) => {

    if (typeof injectCache.styles === 'undefined') {
        injectCache.styles = (needInjectCritical && typeof filemap['critical.css'] === 'string')
            ? getCritical()
            : ''
    }

    return getDevExtra() + injectCache.styles + stylesHtml

}

const getCritical = () => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev') {
        return `<link id="__koot-critical-styles" media="all" rel="stylesheet" href="${getClientFilePath('critical.css')}" />`
    }
    return `<style id="__koot-critical-styles" type="text/css">${readClientFile('critical.css')}</style>`
}

/**
 * [开发模式] 额外内容
 */
const getDevExtra = () => {
    if (process.env.WEBPACK_BUILD_ENV !== 'dev') return ''

    // 判断是否存在 dll 文件，如果存在，在此引入
    const fileDll = path.resolve(process.env.KOOT_DIST_DIR, filenameDll)
    if (fs.existsSync(fileDll))
        return `<script type="text/javascript" src="${dll}"></script>`

    return ''
}
