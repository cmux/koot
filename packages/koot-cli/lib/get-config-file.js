import path from 'node:path';
import fs from 'fs-extra';

/**
 * 获取配置文件的路径名
 * @async
 * @param {String} cwd
 * @returns {String}
 */
const getConfigFile = async (cwd = process.cwd()) => {
    let test = path.resolve(cwd, 'koot.config.js');

    if (fs.existsSync(test)) return test;

    test = path.resolve(cwd, 'koot.build.js');
    if (fs.existsSync(test)) return test;

    return '';
};

export default getConfigFile;
