const fs = require('fs');
const path = require('path');
const isUrl = require('is-url');
// const { sources } = require('webpack');

const getSourceContent = require('koot-webpack/libs/get-source-content');

const {
    GLOBAL_VAR_BUILD_COMPILATION_FOR_SPA_INJECTION,
} = require('../defaults/before-build');
const getFilePath = require('./get-client-file-path');
const generateFilemap = require('./generate-filemap-from-compilation');
const getDistPath = require('./get-dist-path');
const getPort = require('./get-port');
const getDirDistPublic = require('../libs/get-dir-dist-public');

// ============================================================================

/**
 * 读取目标客户端打包结果文件的内容
 * @param {String} filename 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系
 * @param {String} [localeId] 当前语言
 * @param {Object} [compilation] Webpack compilation 对象
 * @param {Boolean} [isPathname=false] 如果标记为 true，表示提供的 filename 为确切的访问地址，无需查询对照表，直接返回结果
 * @returns {String} 文件内容
 */
const readClientFile = (
    filename,
    localeId,
    compilation,
    isPathname = false
) => {
    // 如果第一个参数为 true，表示标记为 pathname
    if (filename === true)
        return readClientFile(
            localeId,
            compilation || undefined,
            isPathname || undefined,
            true
        );

    const fileExtName = path.extname(filename);
    const filenameWithoutExtname = path.basename(filename, fileExtName);

    if (!compilation)
        compilation =
            global[GLOBAL_VAR_BUILD_COMPILATION_FOR_SPA_INJECTION] || undefined;

    // 如果提供了 webpack compilation 数据，尝试从其中查询对应文件的最终内容并返回
    if (typeof compilation === 'object') {
        const filemap = generateFilemap(compilation);
        if (typeof filemap === 'object') {
            // console.log(compilation.chunks);

            const files = [];

            // 根据文件名/特征名从查找特定 chunk，利用其内的文件列表
            [...compilation.chunks]
                .filter(
                    ({ name }) =>
                        name === filename || name === filenameWithoutExtname
                )
                .forEach((chunk) => {
                    [...chunk.files].forEach((file) => {
                        files.push(file);
                    });
                });

            // 如果上述操作不存在有效的文件，利用 koot 生成的 manifest 查询
            if (!files.length) files.push(filename);

            // console.log({ filename, files });

            // 如果有文件，直接使用，查询 asset
            return files
                .filter((filename) => path.extname(filename) === fileExtName)
                .map((file) => getSourceContent(compilation.getAsset(file)))
                .join('\n');
        }
    }

    // console.log(filename, filenameWithoutExtname);

    // 在打包结果中寻找指定文件
    let pathnames = getFilePath(filename, localeId, isPathname, true);
    if (!Array.isArray(pathnames)) pathnames = [pathnames];

    const results = pathnames.map((pathname) => {
        if (isUrl(pathname)) {
            if (__DEV__) {
                const syncRequest = require('sync-request');
                // console.log(`${pathname} is URL`)
                return syncRequest('GET', pathname, {}).getBody();
            } else {
                return `<!-- The pathname for file '${filename}' is a URL. Rendering file content from URL can only be done in DEV mode. -->`;
            }
        }

        if (
            process.env.WEBPACK_BUILD_TYPE === 'spa' &&
            process.env.WEBPACK_BUILD_ENV === 'dev'
        ) {
            return `<!-- http://localhost:${getPort()}${pathname} -->`;
            // const syncRequest = require('sync-request')
            // return syncRequest('GET', `http://localhost:${getPort()}${pathname}`, {}).getBody()
        }

        return fs.readFileSync(
            path.resolve(
                getDirDistPublic(getDistPath()),
                pathname.replace(/^\//, '')
            ),
            'utf-8'
        );
    });

    return results.join('\n\n');
};

module.exports = readClientFile;
