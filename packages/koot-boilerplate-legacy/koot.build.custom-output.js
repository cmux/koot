const path = require('path')
const base = require('./koot.build')

const dist = './dist-custom/'

module.exports = Object.assign({}, base, {
    dist,
    config: async () => {
        if (process.env.WEBPACK_BUILD_ENV === 'dev')
            return await require('./config/webpack/dev')
        if (process.env.WEBPACK_BUILD_ENV === 'prod') {
            const config = await require('./config/webpack/prod')
            config.output.path = path.resolve(__dirname, dist, 'public', 'custom')
            config.output.publicPath = '/custom'
            return config
        }
        return {}
    },
})
