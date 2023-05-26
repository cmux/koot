import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';

import '../typedef.js';

/**
 * 获取 Koot.js app 配置对象
 *
 * @async
 * @param {string} pathname 配置文件路径，或项目路径
 * - 如果是目录，会尝试自动寻找配置文件
 * @returns {Promise<AppConfig>}
 */
async function getAppConfig(pathname) {
    if (!fs.pathExistsSync(pathname))
        throw new Error('FILE OR DIRECTORY NOT EXIST');

    if (fs.lstatSync(pathname).isDirectory()) {
        ['koot.config.js', 'koot.config.cjs', 'koot.config.ejs'].some(
            (filename) => {
                const thisFile = path.resolve(pathname, filename);
                if (!fs.pathExistsSync(thisFile)) return false;
                pathname = thisFile;
                return true;
            }
        );
    }

    const thisModule = await import(url.pathToFileURL(pathname));

    if (!!thisModule.default) return thisModule.default;
    return thisModule;
}

export default getAppConfig;
