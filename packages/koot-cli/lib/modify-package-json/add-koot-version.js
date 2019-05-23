const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');

/**
 * 将当前项目使用的 Koot.js 的最初版本信息添加到 package.json 中 (`koot.baseVersion`)
 * @async
 * @void
 * @param {String} dir 项目目录
 */
module.exports = async dir => {
    if (typeof dir !== 'string') throw new Error('`dir` not provided');

    const filePackageJson = path.resolve(dir, 'package.json');

    if (!fs.existsSync(filePackageJson))
        throw new Error('`package.json` not found');

    const p = await fs.readJson(filePackageJson);

    if (typeof p.koot !== 'object') p.koot = {};
    if (p.koot.baseVersion) return;

    let kootBaseVersion;

    // 先判断已安装的 koot 依赖的版本
    if (
        fs.existsSync(path.resolve(dir, 'node_modules')) &&
        fs.existsSync(path.resolve(dir, 'node_modules/koot')) &&
        fs.existsSync(path.resolve(dir, 'node_modules/koot/package.json'))
    ) {
        const { version } = await fs.readJson(
            path.resolve(dir, 'node_modules/koot/package.json')
        );
        kootBaseVersion = version;
    } else {
        // 如果没有安装 koot，采用当前依赖的版本
        const {
            dependencies = {},
            devDependencies = {},
            optionalDependencies = {}
        } = p;
        kootBaseVersion =
            optionalDependencies.koot ||
            devDependencies.koot ||
            dependencies.koot;
    }

    if (!kootBaseVersion) throw new Error('version invalid');

    p.koot.baseVersion = semver
        .clean(kootBaseVersion)
        .split('.')
        .splice(0, 2)
        .join('.');

    await fs.writeJson(filePackageJson, p);

    return;
};
