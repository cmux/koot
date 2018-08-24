const fs = require('fs-extra')
const getChunkmapPath = require('./get-chunkmap-path')
const getDistPath = require('./get-dist-path')

/**
 * 获取打包文件对应表 (chunkmap)
 * 
 * @param {String} [localeId] 当前语言，默认为当前语言 (i18n开启时) 或未指定 (i18n未开启时)
 * @param {Boolean} [getFullResult = false] 仅 i18n 开启时：获取 chunkmap 全文，而非当前语言的片段
 * @returns {Object}
 */
const getChunkmap = (localeId, getFullResult = false) => {
    if (localeId === true) return getChunkmap(getFullResult || undefined, true)

    if (typeof localeId === 'undefined') {
        try {
            localeId = require('../i18n').localeId
        } catch (e) { }
    }

    const i18nType = JSON.parse(process.env.KOOT_I18N)
        ? JSON.parse(process.env.KOOT_I18N_TYPE)
        : undefined
    const isI18nDefault = (i18nType === 'default')

    let chunkmap
    if (typeof global.chunkmap === 'object') chunkmap = global.chunkmap
    try {
        chunkmap = JSON.parse(process.env.WEBPACK_CHUNKMAP)
    } catch (e) {
        chunkmap = false
    }

    if (typeof chunkmap !== 'object' && typeof getDistPath() === 'string') {
        chunkmap = fs.readJsonSync(getChunkmapPath())
        if (process.env.WEBPACK_BUILD_STAGE === 'server')
            global.chunkmap = chunkmap
    }

    if (typeof chunkmap === 'object') {
        // let chunkmap = fs.readJsonSync(pathChunckmap)
        if (getFullResult) return chunkmap || {}
        if (isI18nDefault) chunkmap = chunkmap[`.${localeId}`] || {}
    }

    return chunkmap || {}
}

module.exports = getChunkmap
