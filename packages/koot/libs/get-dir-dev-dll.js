import path from 'node:path';
import getDirDevTmp from './get-dir-dev-tmp.js';

/**
 * _仅针对开发环境_ 获取 DLL 文件存放路径
 * @param {String} cwd
 * @param {String} [stage]
 * @returns {String}
 */
const getDirDevDll = (cwd, stage = process.env.WEBPACK_BUILD_STAGE) =>
    path.resolve(getDirDevTmp(cwd), 'dll', stage);
export default getDirDevDll;
