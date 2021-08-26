const getClientFilePath = require('./get-client-file-path');

/**
 * 根据内部的请求地址 `pathname` 返回真正的页面内的请求 URI
 * @param {string|Array<string>} pathname
 * @returns {string|undefined|Array<string>}
 */
function getURI(pathname) {
    function filter(value) {
        return typeof value === 'string' && value !== '';
    }

    if (Array.isArray(pathname)) return pathname.map(getURI).filter(filter);

    if (filter(pathname)) return getClientFilePath(true, pathname);

    return undefined;
}

module.exports = getURI;
