const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-test-ssr-memory-leak/',
    i18n: [baseConfig.i18n[0]],
    // serverPackAll: true,
    renderCache: false,
});
