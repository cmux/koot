import getConfigFile from './get-config-file.js';

/**
 * 读取配置文件对象
 * @async
 * @param {String} cwd
 * @returns {Object}
 */
const readConfigFile = async (cwd = process.cwd()) => {
    const file = await getConfigFile(cwd);
    return await import(file);
};

export default readConfigFile;
