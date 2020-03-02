const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-spa-3/',
    type: 'react-spa',
    bundleVersionsKeep: false,
    i18n: false
});
