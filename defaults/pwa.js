const path = require('path')

module.exports = {
    auto: true,
    pathname: '/service-worker.js',
    template: path.resolve(__dirname, '../core/pwa/sw-template.js'),
    initialCache: '/**/*',
    initialCacheAppend: [],
    initialCacheIgonre: [],
}
