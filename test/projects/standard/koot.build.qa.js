const base = require('./koot.build')

module.exports = Object.assign({}, base, {
    dist: './dist-qa/',
    defines: Object.assign({}, base.defines, {
        __QA__: JSON.stringify(true),
    }),
})
