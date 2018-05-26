const fs = require('fs-extra')
const getChunkmapPath = require('./get-chunkmap-path')

/**
 * 获取 chunkmap
 * 
 * @param {string} [localeId] 当前语言
 * @returns {Object} chunkmap
 */
module.exports = (localeId) => {
    if (typeof localeId === 'undefined') {
        try {
            localeId = require('super-project/i18n').localeId
        } catch (e) { }
    }

    const i18nType = JSON.parse(process.env.SUPER_I18N)
        ? JSON.parse(process.env.SUPER_I18N_TYPE)
        : undefined
    const isI18nDefault = (i18nType === 'default')

    let chunkmap
    if (typeof global.chunkmap === 'object') chunkmap = global.chunkmap
    try {
        chunkmap = JSON.parse(process.env.WEBPACK_CHUNKMAP)
    } catch (e) {
        chunkmap = false
    }

    if (typeof chunkmap !== 'object' && typeof process.env.SUPER_DIST_DIR === 'string') {
        chunkmap = fs.readJsonSync(getChunkmapPath())
        if (process.env.WEBPACK_BUILD_STAGE === 'server')
            global.chunkmap = chunkmap
    }

    if (typeof chunkmap === 'object') {
        // let chunkmap = fs.readJsonSync(pathChunckmap)
        if (isI18nDefault) chunkmap = chunkmap[`.${localeId}`] || {}
    }

    return chunkmap || {}
}
