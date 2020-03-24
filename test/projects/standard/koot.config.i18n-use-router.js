const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-i18n-use-router/',
    store: './src/store/create-method-2',
    i18n: {
        use: 'router',
        locales: baseConfig.i18n,
    },

    cookiesToStore: 'all',
    sessionStore: 'all',
    distClientAssetsDirName: '__assets__',
});
