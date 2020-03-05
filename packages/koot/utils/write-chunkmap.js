/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');

const generateFilemap = require('./generate-filemap-from-compilation');
const getChunkmapPath = require('./get-chunkmap-path');
const getOutputsPath = require('./get-outputs-path');
const getDistPath = require('./get-dist-path');

// const times = n => f => {
//     const iter = i => {
//         if (i === n) return;
//         f(i);
//         iter(i + 1);
//     };
//     return iter(0);
// };

const isNotSourcemap = filename => !/\.(js|css)\.map$/i.test(filename);

// const log = (obj, spaceCount = 1, deep = 2) => {
//     if (typeof obj === 'object') {
//         let spaces = '';
//         times(spaceCount)(() => {
//             spaces += '    ';
//         });
//         for (const key in obj) {
//             console.log(spaces + key);
//             if (spaceCount < deep) log(obj[key], spaceCount + 1, deep);
//         }
//     }
// };

/**
 * 写入打包文件对应表 (chunkmap) 和输出的文件列表 (outputs)
 * @param {*} stats
 * @param {*} localeId
 * @param {string} [pathPublic]
 * @param {string} [serviceWorkerPathname]
 * @returns {Object} 打包文件对应表 (chunkmap)
 */
module.exports = async (
    compilation,
    localeId,
    pathPublic,
    serviceWorkerPathname
    // extraAssets = []
) => {
    if (typeof compilation !== 'object') return {};

    const stats = compilation.getStats().toJson();

    const chunkmap = {};
    const entryChunks = {};

    // const dirRelative = path.relative(getDistPath(), stats.compilation.outputOptions.path).replace(`\\`, '/')
    const dirRelative = path
        .relative(getDistPath(), stats.outputPath)
        .replace(/\\/g, '/');
    const filepathname = getChunkmapPath();
    const { outputPath } = stats;

    if (pathPublic) {
        const relative = path
            .relative(getDistPath(), pathPublic)
            .replace(/\\/g, '/');
        chunkmap['.public'] =
            relative +
            (relative.substr(0, relative.length - 1) === '/' ? '' : '/');
    }
    if (outputPath) {
        const relative = path
            .relative(getDistPath(), outputPath)
            .replace(/\\/g, '/');
        chunkmap['.out'] =
            relative +
            (relative.substr(0, relative.length - 1) === '/' ? '' : '/');
    }

    fs.ensureFileSync(filepathname);

    const getFilePathname = file => {
        if (process.env.WEBPACK_BUILD_ENV === 'dev') return file;
        // const r = path
        //     .relative(
        //         path.resolve(getDistPath(), '..'),
        //         path.resolve(dirname, file)
        //     )
        //     .replace(/\\/g, '/');
        // console.log('\n', getDistPath(), stats.outputPath, {dirname, file, r})
        return path
            .relative(getDistPath(), path.resolve(stats.outputPath, file))
            .replace(/\\/g, '/');
        // return r
    };

    // for (let key in stats.compilation) {
    //     console.log(key)
    // }

    // 生成入口对照表
    // if (stats.compilation.entrypoints) {
    //     stats.compilation.entrypoints.forEach((value, key) => {
    //         entryChunks[key] = []
    //         value.chunks.forEach(chunk => {
    //             if (Array.isArray(chunk.files))
    //                 chunk.files
    //                     .filter(file => isNotSourcemap(file))
    //                     .forEach(file =>
    //                         entryChunks[key].push(getFilePathname(dirRelative, file))
    //                     )
    //         })
    //     })
    //     chunkmap['.entrypoints'] = entryChunks
    // }

    if (typeof stats.entrypoints === 'object') {
        Object.keys(stats.entrypoints).forEach(key => {
            const { assets } = stats.entrypoints[key];
            if (!Array.isArray(assets)) return;
            entryChunks[key] = [];
            assets
                .filter(filename => isNotSourcemap(filename))
                .forEach(filename =>
                    entryChunks[key].push(getFilePathname(filename))
                );
        });
        chunkmap['.entrypoints'] = entryChunks;
    }

    // 生成文件对照表
    chunkmap['.files'] = generateFilemap(compilation, dirRelative);

    // 生成所有入口和代码片段所输出的文件的对照表
    if (Array.isArray(stats.chunks)) {
        // console.log(stats.chunks)
        // for (let id in stats.compilation.chunks) {
        //     const o = stats.compilation.chunks[id]
        for (const id in stats.chunks) {
            const o = stats.chunks[id];
            if (typeof o.name === 'undefined' || o.name === null) continue;
            chunkmap[o.name] = o.files;

            if (Array.isArray(o.files))
                chunkmap[o.name] = o.files
                    .filter(filename => isNotSourcemap(filename))
                    .map(filename => getFilePathname(filename));
        }
    }

    // 添加 service-worker
    if (serviceWorkerPathname) {
        chunkmap['service-worker'] = [getFilePathname(serviceWorkerPathname)];
    }

    let json = {};

    if (localeId) {
        json = fs.readJsonSync(filepathname);
        json[`.${localeId}`] = chunkmap;
    } else {
        json = chunkmap;
    }

    await fs.writeJsonSync(filepathname, json, {
        spaces: 4
    });

    // ========================================================================
    // 输出的文件列表
    // ========================================================================
    if (
        process.env.WEBPACK_BUILD_ENV === 'prod' &&
        typeof process.env.KOOT_BUILD_START_TIME === 'string'
    ) {
        const assets = compilation.getAssets();
        if (Array.isArray(assets)) {
            const fileOutputs = getOutputsPath();
            const buildTimestamp = process.env.KOOT_BUILD_START_TIME;
            let existResult = {};

            try {
                existResult = fs.readJsonSync(fileOutputs);
            } catch (e) {
                fs.writeJsonSync(fileOutputs, {});
            }

            const {
                [process.env.KOOT_BUILD_START_TIME]: list = []
            } = existResult;

            /** 本次打包输出的所有文件的列表 */
            assets
                .filter(
                    asset =>
                        typeof asset === 'object' &&
                        typeof asset.name === 'string'
                )
                .map(({ name }) => getFilePathname(name))
                .filter(file => !list.includes(file))
                .forEach(file => list.push(file));

            existResult[buildTimestamp] = list.sort();
            fs.writeJsonSync(fileOutputs, existResult, {
                spaces: 4
            });
        }
    }

    return json;
};
