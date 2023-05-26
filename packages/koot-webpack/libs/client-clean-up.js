const fs = require('fs-extra');
const fsPromises = require('fs').promises;
const path = require('path');
const glob = require('glob-promise');

const {
    keyConfigBuildDll,
    CLIENT_ROOT_PATH,
    filenameBuilding,
    filenameBuildFail,
} = require('koot/defaults/before-build');
const getOutputsFile = require('koot/utils/get-outputs-path');
const resolveRequire = require('koot/utils/resolve-require');

// ============================================================================

/** @type {string[]} 需要清理的 ID 列表 */
const listIds = [];
/** @type {string[]} 需要清理的文件列表 */
const listFiles = [];

// ============================================================================

/**
 * 检查当前环境是否满足条件，不满足条件不予运行。需要同时满足以下条件
 * - 客户端
 * - 生产环境
 * - 不是 analyze
 */
const check = (config = {}) =>
    Boolean(
        !config.analyze &&
            !config[keyConfigBuildDll] &&
            process.env.WEBPACK_BUILD_STAGE === 'client' &&
            process.env.WEBPACK_BUILD_ENV === 'prod'
    );

// ============================================================================

/**
 * 决定哪些文件和内容需要清理
 * @async
 * @param {Object} config Koot app 配置对象
 */
const determine = async (config = {}) => {
    // 不满足条件不予运行
    if (!check(config)) return;

    const { dist, bundleVersionsKeep, [CLIENT_ROOT_PATH]: clientRoot } = config;
    // console.log({ dist, bundleVersionsKeep });

    /** outputs.json 文件 */
    const fileOutputs = getOutputsFile(dist);
    let outputs = {};

    try {
        outputs = fs.readJsonSync(fileOutputs);
    } catch (e) {
        outputs = {};
    }

    /**
     * 🏴 满足以下任意条件时，标记当前所有文件为需要清理
     * - 不存在 outputs.json 文件
     * - outputs.json 文件为空
     * - bundleVersionsKeep 为 false 或 0
     **/
    const forceCleanAll = Boolean(
        !fs.existsSync(fileOutputs) ||
            Object.keys(outputs).length < 1 ||
            bundleVersionsKeep === false ||
            (typeof bundleVersionsKeep === 'number' && bundleVersionsKeep < 1)
    );
    const ignore = [
        path.resolve(clientRoot, filenameBuilding),
        path.resolve(clientRoot, filenameBuildFail),
    ];
    if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
        if (process.env.KOOT_BUILD_TARGET === 'electron') {
            await resolveRequire('koot-electron', 'libs/modify-client-clean-up')
                .getIgnores(clientRoot)
                .forEach((glob) => ignore.push(glob));
        } else {
            ignore.push(path.resolve(clientRoot, '.server/**/*'));
        }
    }
    /** @type {string[]} 目前存在的文件列表 */
    const filesStored = (
        await glob(path.resolve(clientRoot, '**/*'), {
            dot: true,
            ignore,
        })
    )
        .filter((file) => !fs.lstatSync(file).isDirectory())
        .map((file) => path.normalize(file));

    if (forceCleanAll) {
        // 标记当前所有文件为需要清理
        Object.keys(outputs).forEach((id) => listIds.push(id));
        filesStored.forEach((file) => listFiles.push(file));
    } else {
        /** 需要保留的最近打包数 */
        const preserveCount =
            typeof bundleVersionsKeep === 'number' ? bundleVersionsKeep - 1 : 1;

        /** outputs.json 中已存在的时间戳 ID，按时间排序，由新到旧 */
        const existTimestampIds = Object.keys(outputs)
            .map((id) => parseInt(id))
            .sort((a, b) => b - a)
            .map((id) => id + '');

        // 按时间戳将最近 preserveCount 次之外的时间戳 ID 添加到 listIds
        existTimestampIds
            .slice(preserveCount)
            .forEach((id) => listIds.push(id));

        /** @type {string[]} 需要保留的文件列表 */
        const filesPreserved = [];
        // 按时间戳将最近 preserveCount 次打包的文件列表追加到 filesPreserved
        existTimestampIds.slice(0, preserveCount).forEach((id) => {
            outputs[id]
                .map((file) => path.resolve(dist, file))
                .filter((file) => !filesPreserved.includes(file))
                .forEach((file) => filesPreserved.push(file));
        });

        // console.log({
        //     filesStored,
        //     filesPreserved,
        //     bundleVersionsKeep,
        //     preserveCount
        // });

        // 比对两个 Array，将不属于 filesPreserved 的文件追加到 listFiles
        filesStored
            .filter((file) => !filesPreserved.includes(file))
            .forEach((file) => listFiles.push(file));
    }
};

/**
 * 清理操作
 * @async
 * @param {Object} config Koot app 配置对象
 */
const clean = async (config = {}) => {
    // 不满足条件不予运行
    if (!check(config)) return;

    const { dist } = config;

    /** outputs.json 文件 */
    const fileOutputs = getOutputsFile(dist);
    let outputs = {};

    try {
        outputs = fs.readJsonSync(fileOutputs);
    } catch (e) {
        outputs = {};
    }

    // 获取最新一次打包的文件列表，再进行一次比对，以防误删
    let finalList = listFiles;
    if (Object.keys(outputs).length) {
        const latestId = Object.keys(outputs)
            .map((id) => parseInt(id))
            .sort((a, b) => b - a)
            .map((id) => id + '')[0];
        const latestFiles = outputs[latestId].map((file) =>
            path.resolve(dist, file)
        );
        finalList = listFiles.filter((file) => !latestFiles.includes(file));
    }
    // console.log({ dist, listIds, finalList });

    listIds.forEach((id) => delete outputs[id]);
    for (const file of finalList) {
        await fs.remove(file);
    }

    await fs.writeJson(fileOutputs, outputs, {
        spaces: 4,
    });

    // 移除所有空目录
    await removeEmptyDirectories(dist);
};

module.exports = {
    determine,
    clean,
};

// ============================================================================
/**
 * Recursively removes empty directories from the given directory.
 *
 * If the directory itself is empty, it is also removed.
 *
 * Code taken from: https://gist.github.com/jakub-g/5903dc7e4028133704a4
 *
 * https://gist.github.com/fixpunkt/fe32afe14fbab99d9feb4e8da7268445
 *
 * @param {string} directory Path to the directory to clean up
 */
async function removeEmptyDirectories(directory) {
    // lstat does not follow symlinks (in contrast to stat)
    const fileStats = await fsPromises.lstat(directory);
    if (!fileStats.isDirectory()) {
        return;
    }
    let fileNames = await fsPromises.readdir(directory);
    if (fileNames.length > 0) {
        const recursiveRemovalPromises = fileNames.map((fileName) =>
            removeEmptyDirectories(path.join(directory, fileName))
        );
        await Promise.all(recursiveRemovalPromises);

        // re-evaluate fileNames; after deleting subdirectory
        // we may have parent directory empty now
        fileNames = await fsPromises.readdir(directory);
    }

    if (fileNames.length === 0) {
        // console.log('Removing: ', directory);
        await fsPromises.rmdir(directory);
    }
}
