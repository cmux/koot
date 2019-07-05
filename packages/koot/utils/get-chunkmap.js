const fs = require('fs-extra');

const getIsI18nEnabled = require('../i18n/is-enabled');
const getI18nType = require('../i18n/get-type');
const getChunkmapPath = require('./get-chunkmap-path');
const getDistPath = require('./get-dist-path');

let cachedChunkmap;

/**
 * 获取打包文件对应表 (chunkmap)
 *
 * @param {String} [localeId] 当前语言，默认为当前语言 (i18n开启时) 或未指定 (i18n未开启时)
 * @param {Boolean} [getFullResult = false] 仅 i18n 开启时：获取 chunkmap 全文，而非当前语言的片段
 * @returns {Object}
 */
const getChunkmap = (localeId, getFullResult = false) => {
    if (localeId === true) return getChunkmap(getFullResult || undefined, true);

    const isI18nEnabled = getIsI18nEnabled();

    if (isI18nEnabled && typeof localeId === 'undefined') {
        try {
            localeId = require('../index').localeId;
        } catch (e) {}
    }

    const i18nType = getI18nType();
    const isI18nDefault = isI18nEnabled && i18nType === 'default';

    const chunkmap = (() => {
        if (cachedChunkmap) return cachedChunkmap;

        let chunkmap;

        if (typeof global.chunkmap === 'object') chunkmap = global.chunkmap;
        try {
            chunkmap = JSON.parse(process.env.WEBPACK_CHUNKMAP);
        } catch (e) {
            chunkmap = false;
        }
        if (typeof chunkmap !== 'object' && typeof getDistPath() === 'string') {
            chunkmap = fs.readJsonSync(getChunkmapPath());
            if (process.env.WEBPACK_BUILD_STAGE === 'server')
                global.chunkmap = chunkmap;
        }

        if (process.env.WEBPACK_BUILD_ENV === 'prod') cachedChunkmap = chunkmap;

        return chunkmap;
    })();

    if (typeof chunkmap === 'object') {
        // let chunkmap = fs.readJsonSync(pathChunckmap)
        if (getFullResult) return chunkmap || {};
        if (isI18nEnabled && isI18nDefault)
            return chunkmap[`.${localeId}`] || {};
    }

    return chunkmap || {};
};

module.exports = getChunkmap;
