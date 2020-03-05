const path = require('path');

const getDirDistPublicFoldername = require('./get-dir-dist-public-foldername');

/**
 * 获取打包结果基础目录
 * 最终的打包目录是该目录下的 includes (默认情况)
 * @param {String} dist 打包结果目录
 * @returns {String}
 */
module.exports = dist => {
    if (!result) {
        result = path.resolve(dist, getDirDistPublicFoldername());
    }

    return result;
};

let result;
