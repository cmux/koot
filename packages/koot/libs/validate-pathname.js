import fs from 'node:fs';
import path from 'node:path';

import getCwd from '../utils/get-cwd.js';

/**
 * 根据输入的字符串返回合法、存在的路径名
 * @param {String} str
 * @param {String} [cwd]
 * @returns {String}
 */
const validatePathname = (str, cwd = '.') => {
    if (isExist(str)) return str;

    {
        const p = path.resolve(cwd, str);
        if (isExist(p)) return p;
    }

    {
        const p = path.resolve(process.cwd(), str);
        if (isExist(p)) return p;
    }

    {
        const p = path.resolve(getCwd(), str);
        if (isExist(p)) return p;
    }

    {
        const p = path.resolve(getCwd(), 'node_modules', str);
        if (isExist(p)) return p;
    }

    return str;
};
export default validatePathname;

const isExist = (pathname) => {
    if (fs.existsSync(pathname)) return true;

    if (fs.existsSync(pathname + '.js')) return true;

    if (fs.existsSync(pathname + '.mjs')) return true;

    if (fs.existsSync(pathname + '.jsx')) return true;

    return false;
};
