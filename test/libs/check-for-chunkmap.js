const fs = require('fs-extra');
const path = require('path');

const {
    buildManifestFilename,
    compilationKeyHtmlMetaTags,
} = require('../../packages/koot/defaults/before-build');

const specialKeys = [
    '.public',
    '.out',
    '.entrypoints',
    '.files',
    'service-worker',
    compilationKeyHtmlMetaTags,
];

/**
 * 检查 chunkmap，执行回调
 * @async
 * @param {String} dist
 * @param {Function} func
 */
module.exports = async (dist, func) => {
    const file = path.resolve(dist, buildManifestFilename);
    expect(fs.existsSync(file)).toBe(true);

    const chunkmap = await fs.readJson(file);
    expect(typeof chunkmap).toBe('object');
    expect(Array.isArray(chunkmap)).toBe(false);

    /** @type {String[]} 过滤掉特殊 key 后剩余的属性 */
    const restKeys = Object.keys(chunkmap).filter(
        (key) => !specialKeys.includes(key)
    );

    const getMap = (map) => {
        const { [compilationKeyHtmlMetaTags]: _, ...rest } = map;
        return rest;
    };

    if (restKeys.length) {
        // 过滤掉特殊 key 后已仍有属性，表示当前 chunkmap 文件为 i18n 开启同时使用拆包方式
        for (const localeId of restKeys) {
            await func(getMap(chunkmap[localeId]));
        }
    } else {
        await func(getMap(chunkmap));
    }
};
