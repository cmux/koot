const path = require('path')
const baseConfig = require('./koot.config')

module.exports = Object.assign({}, baseConfig, {
    dist: path.resolve(__dirname, 'dist-bundles-keep-3'),
    bundleVersionsKeep: 3,
})
