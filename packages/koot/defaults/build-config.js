const path = require('path')
const getCwd = require('../utils/get-cwd')

module.exports = {
    dist: path.resolve(getCwd(), './dist'),
    config: {},
    aliases: {},
    i18n: false,
    pwa: true,
    devServer: {},
    beforeBuild: () => { },
    afterBuild: () => { },
    port: undefined,
    defines: {},
    webpackDll: []
}
