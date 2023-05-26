import path from 'node:path';
import getCwd from '../utils/get-cwd.js';

/**
 * _仅针对开发环境_ 获取开发环境临时目录
 * @param {String} [cwd]
 * @param {String} [type]
 * @returns {String} 如果提供 `type`，则返回对应类型的目录
 */
const getDirDevTmp = (cwd = getCwd(), type = '') =>
    path.resolve(cwd, 'logs/dev', type ? `.${type}` : '');

export default getDirDevTmp;
