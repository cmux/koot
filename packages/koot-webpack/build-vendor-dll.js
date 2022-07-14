const { keyConfigBuildDll } = require('koot/defaults/before-build');
const build = require('./build');

/**
 * Webpack 打包: DLL
 * 参考文档: https://webpack.js.org/plugins/dll-plugin/
 * @async
 * @param {Object} kootBuildConfig
 * @returns {void}
 */
module.exports = async (kootBuildConfig = {}) => {
    kootBuildConfig[keyConfigBuildDll] = true;
    return await build(kootBuildConfig);
};
