const fs = require('fs-extra')
const path = require('path')

module.exports = {

    name: 'Koot Boilerplate',
    template: './src/template.ejs',
    routes: './src/routes',
    redux: {
        combineReducers: './src/store/reducers',
    },
    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '@components': path.resolve('./src/components'),
        '@constants': path.resolve('./src/constants'),
        '@services': path.resolve('./src/services'),
        '@store': path.resolve('./src/store'),
        '@views': path.resolve('./src/views'),
        '@server': path.resolve('./server'),
        "~base.less": path.resolve('./src/constants/less/base.less'),
        "~Assets": path.resolve('./src/assets'),
        "~/": path.resolve('./src')
    },
    staticCopyFrom: path.resolve(__dirname, './public'),

    port: 8081,

    webpackConfig: async () => {
        const ENV = process.env.WEBPACK_BUILD_ENV
        if (ENV === 'dev') return await require('./config/webpack/dev')
        if (ENV === 'prod') return await require('./config/webpack/prod')
        return {}
    },
    webpackBefore: async () => {
        if (process.env.WEBPACK_BUILD_STAGE === 'client') {
            const dist = process.env.KOOT_DIST_DIR
            // await fs.remove(path.resolve(dist, 'public'))
            await fs.remove(path.resolve(dist, 'server'))
        }
        return
    },
    classNameHashLength: 1,
    // bundleVersionsKeep: false,

    devPort: 3081,
    devDll: [
        'react',
        'react-dom',
        'redux',
        'redux-thunk',
        'react-redux',
        'react-router',
        'react-router-redux',
        'koot',
    ],

}
