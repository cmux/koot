import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * 获取指定 NPM 包的版本号
 */
const getModuleVersion = (moduleName) => {
    try {
        const p = require(`${moduleName}/package.json`);
        if (typeof p === 'object' && p.version) return p.version;
        return '';
    } catch (e) {
        return '';
    }
};

export default getModuleVersion;
