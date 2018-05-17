const path = require('path')

module.exports = {
    dist: path.resolve(process.cwd(), './dist'),
    config: {},
    aliases: {},
    i18n: false,
    pwa: true,
    devServer: {},
    beforeBuild: () => { },
    afterBuild: () => { },
    port: undefined,
    defines: {},
}
