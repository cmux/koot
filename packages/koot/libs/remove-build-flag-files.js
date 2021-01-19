const fs = require('fs-extra');
const path = require('path');

const {
    filenameBuilding,
    filenameBuildFail,
} = require('../defaults/before-build');

/**
 * 清理打包标记文件
 * @async
 * @param {String} dist 打包结果目录
 * @param {Boolean} [removeFailFlagFile=false] 是否清理错误标记文件
 */
module.exports = async (
    dist = process.env.KOOT_DIST_DIR,
    removeFailFlagFile = false
) => {
    const filesToRemove = [filenameBuilding];

    if (removeFailFlagFile) filesToRemove.push(filenameBuildFail);

    for (const filename of filesToRemove) {
        const file = path.resolve(dist, filename);
        if (fs.existsSync(file)) await fs.remove(file);
    }
};
