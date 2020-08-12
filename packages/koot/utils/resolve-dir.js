const fs = require('fs-extra');
const path = require('path');
const resolve = require('resolve');
const getCwd = require('./get-cwd');

/**
 * 获取指定 module 在硬盘中的所在目录
 * @param {string} moduleId
 * @returns {string}
 */
module.exports = (moduleId = 'koot') => {
    let file;
    try {
        file = resolve.sync(moduleId, { basedir: getCwd() });
    } catch (e) {
        file = resolve.sync(moduleId, { basedir: __dirname });
    }

    if (!file || !fs.existsSync(file))
        throw new Error(`Module "${moduleId}" not found!`);

    return path.dirname(file);
};
