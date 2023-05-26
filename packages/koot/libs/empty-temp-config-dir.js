import fs from 'fs-extra';
import path from 'node:path';

import { dirConfigTemp as _dirConfigTemp } from '../defaults/before-build.js';
import getCwd from '../utils/get-cwd.js';

/**
 * 清空临时配置文件目录
 * @param {String} cwd
 */
const run = (cwd = getCwd()) => {
    const dirConfigTemp = path.resolve(cwd, _dirConfigTemp);
    if (fs.existsSync(dirConfigTemp)) {
        fs.emptyDirSync(dirConfigTemp);
    }
};

export default run;
