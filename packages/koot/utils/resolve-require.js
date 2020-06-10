const fs = require('fs-extra');
const path = require('path');
const resolveDir = require('./resolve-dir');

/**
 * 获取指定 Module
 * @param {string} moduleId
 * @param {string} pathname
 * @returns {string}
 */
module.exports = (moduleId = 'koot', pathname = '') => {
    if (/^[\\|/]/.test(pathname)) pathname = pathname.substr(1);

    const target = path.resolve(resolveDir(moduleId), pathname);

    try {
        return require(target);
    } catch (e) {
        console.error(e);
        throw new Error(
            `Module "${moduleId}/${pathname}" not found or not a module!`
        );
    }
};
