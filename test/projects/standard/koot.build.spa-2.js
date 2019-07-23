const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-spa-2/',
    type: 'react-spa',
    bundleVersionsKeep: false
});
