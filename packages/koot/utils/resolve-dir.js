import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import resolve from 'resolve';
import getCwd from './get-cwd.js';

/**
 * 获取指定 module 在硬盘中的所在目录
 * @param {string} moduleId
 * @returns {string}
 */
const resolveDir = (moduleId = 'koot') => {
    let file;
    try {
        file = resolve.sync(moduleId, { basedir: getCwd() });
    } catch (e) {
        file = resolve.sync(moduleId, {
            basedir: url.fileURLToPath(new URL('.', import.meta.url)),
        });
    }

    if (!file || !fs.existsSync(file))
        throw new Error(`Module "${moduleId}" not found!`);

    return path.dirname(file);
};

export default resolveDir;
