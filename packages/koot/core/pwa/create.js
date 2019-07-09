const fs = require('fs-extra');
const path = require('path');
const glob = require('glob-promise');
// const md5File = require('md5-file')

const defaults = require('../../defaults/pwa');
const getChunkmapPath = require('../../utils/get-chunkmap-path');
const getDistPath = require('../../utils/get-dist-path');
const getDirDistPublic = require('../../libs/get-dir-dist-public');

const parseChunkmapPathname = pathname => pathname.replace(/^public\//g, '');

const parsePattern = pattern => {
    let firstCharacter = pattern.substr(0, 1);
    let isExclude = false;

    if (firstCharacter === '!') {
        isExclude = true;
        firstCharacter = pattern.substr(1, 1);
    }

    if (firstCharacter === '/')
        return (isExclude ? '!' : '') + pattern.substr(1);

    return pattern;
};
/**`] - 利用 glob 初始化缓存文件列表（替换 service-worker 模板中的 urlsToCache 变量）
 * @param {Object} [settings.globOptions={}] - glob 设置
 * @param {Array} [settings.appendUrls=[]] - 手动追加缓存文件列表（追加到 service-worker 模板中的 urlsToCache 变量）
 * @returns {Promise}
 */

/**
 * 创建 service-worker javascript 文件
 *
 * @param {Object} settings - 设置
 * @param {string} [settings.outputPath=`${process.cwd()}/dist/public/`] - 输出文件目录
 * @param {string} [settings.outputFilename=`service-worker.js`] - 输出文件名
 * @param {boolean} [settings.outputFilenameHash=false] - 输出文件名中是否会加入 MD5 hash。若设为 true，输出文件名会变为 `${basename}.${md5hash}.js`
 * @param {string} [settings.customServiceWorkerPath=path.resolve(__dirname, '../service-worker/index.js')] - service-worker 文件模板
 * @param {string} [settings.globPattern=`/client/**/ const create = async (
    settings = {},
    i18n,
    bundleVersionsKeep
) => {
    // let options = Object.assign({
    //     outputPath: getCwd() + '/dist/public/',
    //     outputFilename: 'service-worker.js',
    //     outputFilenameHash: false,
    //     customServiceWorkerPath: path.resolve(__dirname, '../service-worker/index.js'),
    //     globPattern: '/client/**/*',
    //     globOptions: {},
    //     appendUrls: []
    // }, parseOptions(settings, ...args))
    if (settings === true) settings = {};
    if (settings === false) return;
    const {
        // auto,
        pathname,
        template,
        initialCache,
        initialCacheAppend,
        initialCacheIgonre
    } = Object.assign({}, defaults, settings);

    const pathnamePolyfill = [];
    const pathnameChunkmap = getChunkmapPath();
    const outputPath = getDirDistPublic(getDistPath(), bundleVersionsKeep);
    const i18nType = typeof i18n === 'object' ? i18n.type : undefined;
    const isI18nDefault = i18nType === 'default';

    const createSW = async ({
        chunkmap = {},
        ignores = [],
        pathnameSW = pathname
    }) => {
        const files = [];
        const outputFile = (() => {
            let _pathname = pathnameSW;
            if (_pathname.substr(0, 1) === '/') _pathname = `.${_pathname}`;
            return path.resolve(outputPath, _pathname);
        })();

        await fs.ensureDir(outputPath);

        if (chunkmap.polyfill)
            if (Array.isArray(chunkmap.polyfill)) {
                chunkmap.polyfill.forEach(pathname => {
                    pathnamePolyfill.push(parseChunkmapPathname(pathname));
                });
            } else {
                pathnamePolyfill.push(parseChunkmapPathname(chunkmap.polyfill));
            }
        if (Array.isArray(chunkmap.critical)) {
            chunkmap.critical.forEach(file =>
                ignores.push(parseChunkmapPathname(file))
            );
        }

        const globOptions = {
            cwd: outputPath,
            root: outputPath,
            mark: true,
            nosort: true,
            ignore: ['/*']
                .concat(ignores)
                .concat(pathnamePolyfill)
                .concat(initialCacheIgonre)
                .map(pattern => parsePattern(pattern))
        };

        // if (Array.isArray(initialCacheIgonre))
        //     initialCacheIgonre.forEach((pattern, index) => {
        //         initialCacheIgonre[index] = parsePattern(pattern)
        //     })

        // console.log(globOptions)

        await glob(parsePattern(initialCache), globOptions).then(matches =>
            matches
                .filter(_pathname => _pathname.slice(-1) !== '/')
                .filter(_pathname => {
                    // ignore .map files
                    if (path.extname(_pathname) === '.map') return false;
                    return true;
                })
                .map(_pathname => `/${_pathname}`)
                .concat(initialCacheAppend)
                .forEach(_pathname => files.push(_pathname))
        );

        // 读取 service-worker 模板文件内容
        let content = await fs.readFile(template, { encoding: 'utf8' });

        // 写入
        await fs.writeFile(
            outputFile,
            content.replace(
                /\[\n*\s*\/\*\s*APPEND URLS HERE\s*\*\/\s*\n*]/m,
                JSON.stringify([...new Set(files)], undefined, 4)
            ),
            'utf8'
        );

        return;
    };

    const chunkmapFull = await fs.readJson(pathnameChunkmap, 'utf-8');

    if (isI18nDefault && Array.isArray(i18n.locales)) {
        for (let arr of i18n.locales) {
            const [localeId] = arr;
            const chunksCurrent = [];
            const chunksIgnore = [];
            const chunkmapCurrent = chunkmapFull[`.${localeId}`] || {};
            const extname = path.extname(pathname);
            const pathnameSW =
                pathname.replace(new RegExp(extname + '$', ''), '') +
                '.' +
                localeId +
                extname;

            // 暂存当前语言下的所有 chunk
            for (let chunkname in chunkmapCurrent) {
                if (Array.isArray(chunkmapCurrent[chunkname]))
                    chunkmapCurrent[chunkname].forEach(pathname =>
                        chunksCurrent.push(pathname)
                    );
            }

            // 遍历其他所有语言的 chunk，当前语言中不存在的加入 ignore 列表
            for (let dotLocale in chunkmapFull) {
                if (dotLocale === `.${localeId}`) continue;
                for (let chunkname in chunkmapFull[dotLocale]) {
                    const arr = chunkmapFull[dotLocale][chunkname];
                    if (!Array.isArray(arr)) continue;
                    arr.forEach(pathname => {
                        if (!chunksCurrent.includes(pathname))
                            chunksIgnore.push(parseChunkmapPathname(pathname));
                    });
                }
            }

            await createSW({
                chunkmap: chunkmapCurrent,
                ignores: chunksIgnore,
                pathnameSW
            });

            // 修改 .public-chunkmap.json，添加 service-worker 文件信息
            const inChunkmap =
                (chunkmapCurrent['.public']
                    ? chunkmapCurrent['.public'].replace(/\/$/, '')
                    : '') + pathnameSW;
            chunkmapCurrent['service-worker'] = [inChunkmap.replace(/^\//, '')];

            await fs.writeFile(
                pathnameChunkmap,
                JSON.stringify(chunkmapFull, undefined, 4),
                'utf8'
            );

            console.log(
                `\x1b[32m√\x1b[0m \x1b[93m[koot/build]\x1b[0m PWA: \x1b[32m${pathnameSW}\x1b[0m created`
            );
        }
    } else {
        await createSW({
            chunkmap: chunkmapFull
        });

        // 修改 .public-chunkmap.json，添加 service-worker 文件信息
        const inChunkmap =
            (chunkmapFull['.public']
                ? chunkmapFull['.public'].replace(/\/$/, '')
                : '') + pathname;
        chunkmapFull['service-worker'] = [inChunkmap.replace(/^\//, '')];

        await fs.writeFile(
            pathnameChunkmap,
            JSON.stringify(chunkmapFull, undefined, 4),
            'utf8'
        );

        console.log(
            `\x1b[32m√\x1b[0m \x1b[93m[koot/build]\x1b[0m PWA: \x1b[32m${pathname}\x1b[0m created`
        );
    }
};

module.exports = create;
