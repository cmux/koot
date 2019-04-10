const baseConfig = require('./koot.config')

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-spa/',
    type: 'react-spa',
    // templateInject: undefined
})
