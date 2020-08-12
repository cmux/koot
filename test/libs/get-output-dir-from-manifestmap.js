const fs = require('fs-extra');
const path = require('path');

const {
    buildManifestFilename,
} = require('../../packages/koot/defaults/before-build');

/**
 * 从 manifestmap 中客户端文件路径
 * @param {string} dist
 * @returns {string}
 */
const getOutputDir = async (dist) => {
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

    return path.resolve(dist, (map['.out'] || '').replace(/^\//, ''));
};

module.exports = getOutputDir;
