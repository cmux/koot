import getDirDevTmp from './get-dir-dev-tmp.js';

/**
 * _仅针对开发环境_ 获取打包缓存结果文件存放路径
 * @param {String} cwd
 * @returns {String}
 */
const getDirDevCache = (cwd) => getDirDevTmp(cwd, 'cache');

export default getDirDevCache;
