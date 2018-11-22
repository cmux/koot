const base = require('./koot.config')

module.exports = Object.assign({}, base, {
    type: 'react-spa',
    dist: './dist-spa/',
    inject: require('./spa/inject'),
})
