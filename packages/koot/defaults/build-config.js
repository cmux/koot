const path = require('path');
const getCwd = require('../utils/get-cwd');

/**
 * 在创建 Webpack 打包配置时使用的默认值，作为 Koot App 配置的 Fallback
 */
module.exports = {
    dist: path.resolve(getCwd(), 'dist'),
    distClientAssetsDirName: 'includes',
    config: {},
    aliases: {},
    i18n: false,
    serviceWorker: true,
    devServer: {},
    // beforeBuild: () => {},
    // afterBuild: () => {},
    port: undefined,
    defines: {},
    webpackDll: [],
};
