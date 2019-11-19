const path = require('path');
const getCwd = require('../utils/get-cwd');

module.exports = {
    dist: path.resolve(getCwd(), './dist'),
    distClientAssetsDirName: 'includes',
    config: {},
    aliases: {},
    i18n: false,
    serviceWorker: true,
    devServer: {},
    beforeBuild: () => {},
    afterBuild: () => {},
    port: undefined,
    defines: {},
    webpackDll: []
};
