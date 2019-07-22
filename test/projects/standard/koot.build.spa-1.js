const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-spa-1/',
    type: 'react-spa',
    bundleVersionsKeep: 2
});
