import path from 'node:path';

import getDistPath from './get-dist-path.js';
import getDirDevTmp from '../libs/get-dir-dev-tmp.js';
import { buildManifestFilename } from '../defaults/before-build.js';

/**
 * 获取打包文件清单文件 (build-manifest) 的文件路径
 * @param {string} [dist] 打包结果目录，默认为项目指定的路径
 * @returns {string}
 */
const getBuildManifestPath = (dist = getDistPath()) => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        return path.resolve(getDirDevTmp(), buildManifestFilename);
    return path.resolve(dist, buildManifestFilename);
};

export default getBuildManifestPath;
