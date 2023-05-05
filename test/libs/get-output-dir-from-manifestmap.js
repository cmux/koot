import fs from 'fs-extra';
import path from 'node:path';

import { buildManifestFilename } from '../../packages/koot/defaults/before-build.js';

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

export default getOutputDir;
