import fs from 'fs-extra';
import path from 'node:path';

import {
    // filenameDll, filenameDllManifest,
    filenameWebpackDevServerPortTemp,
    filenameBuilding,
    filenameBuildFail,
} from '../defaults/before-build.js';

import getDirDevTmp from '../libs/get-dir-dev-tmp.js';
// import getDirDevDll from '../libs/get-dir-dev-dll.js'

import getChunkmapPath from '../utils/get-chunkmap-path.js';

/**
 * 清理打包过程中生成的临时文件
 * @async
 * @param {String} dist
 */
const removeTempBuild = async (dist = process.env.KOOT_DIST_DIR) => {
    if (!dist) return;

    const files = [
        getChunkmapPath(dist),
        // path.resolve(dist, filenameDll),
        // path.resolve(dist, `${filenameDll}.map`),
        // path.resolve(dist, filenameDllManifest),
        path.resolve(getDirDevTmp(), filenameWebpackDevServerPortTemp),
        path.resolve(dist, filenameBuilding),
        path.resolve(dist, filenameBuildFail),
    ];

    for (const file of files) {
        if (fs.existsSync(file)) await fs.remove(file);
    }
};

export default removeTempBuild;
