const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-i18n-use-subdomain/',
    i18n: {
        use: 'subdomain',
        locales: baseConfig.i18n,
    },
});
