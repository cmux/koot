const fs = require('fs-extra');
const path = require('path');

const getI18nType = require('../i18n/get-type');
const getPublicPath = require('./get-public-dir');
const getChunkmap = require('./get-chunkmap');
const { get: getSSRContext } = require('../libs/ssr/context');

/**
 * 获指定文件在客户端/取浏览器端中的可访问路径
 * @param {String} filename 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系
 * @param {String} [localeId] 当前语言
 * @param {Boolean} [isPathname = false] 如果标记为 true，表示提供的 filename 为确切的访问地址，无需查询对照表，直接返回结果
 * @param {Boolean} [isSSRReading = false] 如果标记为 true，表示用于 SSR 时读取文件，会对 publicPath 进行特殊处理
 * @returns {String|String[]} 浏览器环境中的访问路径、空字符串或包含所有可能结果的 Array
 */
const getFilePath = (
    filename,
    localeId,
    isPathname = false,
    isSSRReading = false
) => {
    // 如果第一个参数为 true，表示完全信任，不进行 chunkmap 对照查询，直接进行处理并返回结果
    if (filename === true)
        return getFilePath(
            localeId,
            isPathname || undefined,
            true,
            isSSRReading
        );

    if (typeof localeId === 'undefined') {
        try {
            localeId =
                typeof __KOOT_SPA_TEMPLATE_INJECT__ === 'boolean' &&
                __KOOT_SPA_TEMPLATE_INJECT__
                    ? getSSRContext().LocaleId
                    : require('../index').localeId || undefined;
        } catch (e) {
            // console.error(e);
        }
    }

    const pathPublic = getPublicPath(isSSRReading);

    const i18nType = getI18nType();
    const isI18nDefault = i18nType === 'default';
    const isDev =
        process.env.WEBPACK_BUILD_ENV === 'dev' ||
        (typeof __DEV__ !== 'undefined' && __DEV__);
    // const localeId = 'zh'

    // 如果标记为 pathname，直接返回结果
    if (isPathname)
        return pathPublic + filename.replace(/(^\.\/|^)public\//, '');

    const chunkmap = getChunkmap(localeId);
    const regPublicPath = chunkmap['.public']
        ? new RegExp(`(^\\.\\/|^)${chunkmap['.public']}`)
        : /(^\.\/|^)public\//;

    /**************************************************************************
     *   ┌─┐┌─┐┌┬┐┌┬┐┌─┐┌┐┌  ┌─┐┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
     *  │  │ ││││││││ ││││  ├┤ │ │││││   │ ││ ││││└─┐
     * └─┘└─┘┴ ┴┴ ┴└─┘┘└┘  └  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘
     *************************************************************************/

    /**
     * 返回可供客户端/浏览器端使用的访问地址
     * @param {String} pathname
     * @returns {String}
     */
    const getResultPathname = (pathname) =>
        pathPublic + pathname.replace(regPublicPath, '');

    /**************************************************************************
     *   ┌┬┐┌─┐┌┐ ┬ ┬┌─┐
     *   ││├┤ ├┴┐│ ││ ┬
     * ─┴┘└─┘└─┘└─┘└─┘
     *************************************************************************/

    // console.log('----------')
    // console.log(filename)
    // console.log(chunkmap)
    // console.log(chunkmap['.files'])
    // console.log(chunkmap['.files'][filename])
    // console.log(regPublicPath)
    // console.log(pathPublic + chunkmap['.files'][filename].replace(regPublicPath, ''))
    // console.log({
    //     regPublicPath,
    // })
    // console.log('----------')

    /**************************************************************************
     *   ┌─┐┬ ┬┌─┐┌─┐┬┌─   ┬   ┬─┐┌─┐┌┬┐┬─┐┬ ┬┌┐┌┌─┐
     *  │  ├─┤├┤ │  ├┴┐  ┌┼─  ├┬┘├┤  │ ├┬┘│ ││││└─┐
     * └─┘┴ ┴└─┘└─┘┴ ┴  └┘   ┴└─└─┘ ┴ ┴└─└─┘┘└┘└─┘
     *************************************************************************/

    // 检查 `.files` 下是否有该文件名的直接对应
    // 如果有，直接返回该结果
    if (
        typeof chunkmap === 'object' &&
        typeof chunkmap['.files'] === 'object' &&
        typeof chunkmap['.files'][filename] === 'string'
    ) {
        return getResultPathname(chunkmap['.files'][filename]);
    }
    if (isDev) {
        const prefix = pathPublic + (isI18nDefault ? localeId : '');
        if (
            typeof chunkmap['.files'] === 'object' &&
            typeof chunkmap['.files'][filename] === 'string'
        )
            return prefix + chunkmap['.files'][filename];
        return prefix + `.${filename}`;
    }

    /** @type {String} 目标文件的扩展名 */
    const extname = path.extname(filename);
    /** @type {String} 目标文件的文件名（不包括扩展名） */
    const basename = path.basename(filename, extname);

    // 检查 `.entrypoints` 下是否有该文件的文件名对应（不包括扩展名）
    // 如果有，同时只有一个结果，返回该结果
    // 如果有，同时有多个结果，返回包含所有结果的 Array
    if (Array.isArray(chunkmap['.entrypoints'][basename])) {
        const files = chunkmap['.entrypoints'][basename].filter(
            (file) => path.extname(file) === extname
        );
        if (files.length === 1) return getResultPathname(files[0]);
        else if (files.length)
            return files.map((file) => getResultPathname(file));
    }

    // 检查 chunkmap 第一级是否有包含该文件的文件名的对应（不包括扩展名）
    // 如果有，直接返回该结果
    if (typeof chunkmap === 'object') {
        let result;
        if (Array.isArray(chunkmap[basename])) {
            chunkmap[basename].some((value) => {
                if (path.extname(value) === extname) {
                    result = value;
                    return true;
                }
                return false;
            });
        }
        if (result) return getResultPathname(result);
    }

    // 如果没有找到 chunkmap 或是 chunkmap 中未找到目标项目，转为过滤文件形式
    // if (fs.existsSync(path.resolve(pathPublic, filename))) {
    //     return '/' + filename;
    // }
    if (fs.existsSync(path.resolve(filename))) {
        return pathPublic + filename;
    }

    console.warn(
        `File not found:` +
            (isI18nDefault ? `[${localeId}] ` : '') +
            ` ${filename}`
    );

    return '';

    // const segs = pathname.split('/').filter(seg => seg !== '/')
    // const file = segs.pop()
    // const dir = segs.length ? `${segs.join('/')}/` : ''
    // return `/${dir}${
    //     require('./filterTargetFile')(
    //         require('./readFilesInPath')(`./${distPathname}/public/${appName ? `${appName}/` : ''}${dir}`),
    //         file
    //     )}`
};

module.exports = getFilePath;
// module.exports = (pathname, pathDist = 'dist') => {
//     if (__DEV__) {
//         return `http://localhost:${process.env.WEBPACK_DEV_SERVER_PORT || '3001'}/dist/${pathname}`
//     } else {
//         const segs = pathname.split('/').filter(seg => seg !== '/')
//         const file = segs.pop()
//         const dir = segs.length ? `${segs.join('/')}/` : ''
//         return `/${dir}${
//             require('./filterTargetFile')(
//                 require('./readFilesInPath')(`./${pathDist}/public/${dir}`),
//                 file
//             )}`
//     }
// }
