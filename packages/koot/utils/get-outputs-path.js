import path from 'node:path';

import getDistPath from './get-dist-path.js';
import getDirDevTmp from '../libs/get-dir-dev-tmp.js';
import { buildOutputsFilename } from '../defaults/before-build.js';

/**
 * 获取打包输出的文件列表 (outputs) 的文件路径
 * @param {string} [dist] 打包结果目录，默认为项目指定的路径
 * @returns {string}
 */
const getOutputsPath = (dist = getDistPath()) => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        return path.resolve(getDirDevTmp(), buildOutputsFilename);
    return path.resolve(dist, buildOutputsFilename);
};

export default getOutputsPath;
