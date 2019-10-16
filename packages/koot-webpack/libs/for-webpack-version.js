const semver = require('semver');
const getModuleVersion = require('koot/utils/get-module-version');

/**
 * 根据指定的 Webpack 版本号区间，执行指定的方法
 * @param {string} semverRange 基于 _semver_ 规则的版本号区间
 * @param {Function} func 执行的方法
 * @returns {void}
 */
module.exports = (semverRange, func) => {
    if (typeof semverRange !== 'string')
        throw new Error('`semverRange` needs to be *string*');
    if (typeof func !== 'function')
        throw new Error('`func` needs to be *Function*');

    if (
        semver.satisfies(
            semver.coerce(getModuleVersion('webpack')),
            semverRange
        )
    ) {
        func();
    }
};
