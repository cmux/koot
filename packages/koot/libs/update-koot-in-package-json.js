import fs from 'fs-extra';
import path from 'node:path';

import getCwd from '../utils/get-cwd.js';

/**
 * 更新项目的 `package.json` 中的 `koot` 对象属性
 * @param {*} data
 */
const updateKootInPackageJson = async (data = {}) => {
    const file = path.resolve(getCwd(), 'package.json');

    if (!fs.existsSync(file))
        throw new Error('"package.json" not found in project directory.');

    const p = await fs.readJson(file);
    if (typeof p.koot !== 'object') p.koot = {};

    Object.assign(p.koot, data);

    await fs.writeJson(file, p, {
        spaces: 4,
    });
};

export default updateKootInPackageJson;
