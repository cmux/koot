const base = require('./koot.build')

module.exports = Object.assign({}, base, {
    dist: './dist-spa/',
    inject: require('./src/spa/inject'),
})
