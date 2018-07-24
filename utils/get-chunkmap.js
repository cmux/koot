const path = require('path')
const fs = require('fs-extra')

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
    try {
        chunkmap = JSON.parse(process.env.WEBPACK_CHUNKMAP)
    } catch (e) {
        chunkmap = false
    }

    if (typeof chunkmap !== 'object' && typeof process.env.SUPER_DIST_DIR === 'string') {
        chunkmap = fs.readJsonSync(
            // path.resolve(process.env.SUPER_DIST_DIR, '.public-chunkmap.json')
            path.resolve(process.cwd(), process.env.SUPER_DIST_DIR, '.public-chunkmap.json')
        )
    }

    if (typeof chunkmap === 'object') {
        // let chunkmap = fs.readJsonSync(pathChunckmap)
        if (isI18nDefault) chunkmap = chunkmap[`.${localeId}`] || {}
    }

    return chunkmap || {}
}
