const path = require('path');
const getDistPath = require('./get-dist-path');
const getDirDevTmp = require('../libs/get-dir-dev-tmp');
const { buildManifestFilename } = require('../defaults/before-build');

/**
 * 获取打包文件对应表 (chunkmap) 的文件路径
 * @param {string} [dist] 打包结果目录，默认为项目指定的路径
 * @returns {string}
 */
module.exports = (dist = getDistPath()) => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        return path.resolve(getDirDevTmp(), buildManifestFilename);
    return path.resolve(dist, buildManifestFilename);
};
