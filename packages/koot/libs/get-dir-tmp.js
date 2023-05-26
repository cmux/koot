import path from 'node:path';

import getCwd from '../utils/get-cwd.js';

/**
 * 获取打包过程临时目录
 * @param {String} [cwd]
 * @param {String} [type]
 * @returns {String} 如果提供 `type`，则返回对应类型的目录
 */
const getDirTmp = (cwd = getCwd(), type = '') =>
    path.resolve(cwd, 'logs/tmp', type ? `.${type}` : '');

export default getDirTmp;
