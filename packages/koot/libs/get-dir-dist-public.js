import path from 'path';

import getDirDistPublicFoldername from './get-dir-dist-public-foldername.js';

/**
 * 获取打包结果基础目录
 * 最终的打包目录是该目录下的 includes (默认情况)
 * @param {String} dist 打包结果目录
 * @returns {String}
 */
const getDirDistPublic = (dist) => {
    if (!result) {
        result = path.resolve(dist, getDirDistPublicFoldername());
    }

    return result;
};

let result;

export default getDirDistPublic;
