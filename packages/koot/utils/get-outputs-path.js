const path = require('path');
const getDistPath = require('./get-dist-path');
const getDirDevTmp = require('../libs/get-dir-dev-tmp');
const { buildOutputsFilename } = require('../defaults/before-build');

/**
 * 获取打包输出的文件列表 (outputs) 的文件路径
 * @param {string} [dist] 打包结果目录，默认为项目指定的路径
 * @returns {string}
 */
module.exports = (dist = getDistPath()) => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        return path.resolve(getDirDevTmp(), buildOutputsFilename);
    return path.resolve(dist, buildOutputsFilename);
};
