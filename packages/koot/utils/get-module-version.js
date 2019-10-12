/**
 * 获取指定 NPM 包的版本号
 */
module.exports = moduleName => {
    try {
        const p = require(`${moduleName}/package.json`);
        if (typeof p === 'object' && p.version) return p.version;
        return '';
    } catch (e) {
        return '';
    }
};
