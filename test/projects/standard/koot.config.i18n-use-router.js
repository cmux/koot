const baseConfig = require('./koot.config')

module.exports = Object.assign({}, baseConfig, {
    i18n: {
        use: 'router',
        locales: [
            ['zh', './src/locales/zh.json'],
            ['zh-tw', './src/locales/zh-tw.json'],
            ['en', './src/locales/en.json'],
        ]
    }
})
