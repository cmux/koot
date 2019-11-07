const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-i18n-use-router/',
    store: './src/store/create-method-2',
    i18n: {
        use: 'router',
        locales: [
            ['zh', './src/locales/zh.json'],
            ['zh-tw', './src/locales/zh-tw.json'],
            ['en', './src/locales/en.json']
        ]
    },

    cookiesToStore: 'all',
    sessionStore: 'all',
    distClientAssetsDirName: '__assets__'
});
