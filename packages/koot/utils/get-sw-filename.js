const path = require('path');

/**
 * 获取 service-worker 文件名
 * @param {String} [localeId] 如果提供，则会返回 [basename].[localeId][extname]
 * @returns {String}
 */
module.exports = (filename, localeId) => {
    const { name, ext } = path.parse(filename);
    if (localeId) {
        return `${name}.${localeId}${ext}`;
    }
    return `${name}${ext}`;
};
