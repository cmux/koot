// import fs from 'fs-extra';
import path from 'node:path';

import resolveDir from './resolve-dir.js';

/**
 * 获取指定 Module
 * @async
 * @param {string} moduleId
 * @param {string} pathname
 * @returns {Promise<string>}
 */
const resolveRequire = async (moduleId = 'koot', pathname = '') => {
    if (/^[\\|/]/.test(pathname)) pathname = pathname.substr(1);

    const target = path.resolve(resolveDir(moduleId), pathname);

    try {
        return await import(target).then((mod) => {
            if (!!mod.default) return mod.default;
            return mod;
        });
    } catch (e) {
        console.error(e);
        throw new Error(
            `Module "${moduleId}/${pathname}" not found or not a module!`
        );
    }
};

export default resolveRequire;
