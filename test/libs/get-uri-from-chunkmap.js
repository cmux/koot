const fs = require('fs-extra');
const path = require('path');

const {
    buildManifestFilename
} = require('../../packages/koot/defaults/before-build');

/**
 * 从 chunkmap 中获取指定文件的 URI
 * @param {string} dist
 * @param {string} file
 * @returns {string}
 */
const getUriFromChunkmap = async (dist, file) => {
    const chunkmap = await fs.readJson(
        path.resolve(dist, buildManifestFilename)
    );
    const getMap = (map = chunkmap) => {
        if (
            typeof map['.entrypoints'] === 'object' &&
            typeof map['.files'] === 'object'
        )
            return map;

        const keys = Object.keys(map);

        if (!keys.length) return {};

        return getMap(map[keys[0]]);
    };
    const map = getMap();
    const p = map['.public'] || '';
    const files = map['.files'] || {};

    if (files[file]) return files[file].replace(new RegExp(`^${p}`), '');

    return '';
};

module.exports = getUriFromChunkmap;
