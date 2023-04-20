const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-public-path/',
    routes: './src/router/functional.js',
    webpackConfig: async (...args) => {
        if (process.env.WEBPACK_BUILD_ENV === 'prod') {
            const config = await require('./config/webpack/prod')();
            config.output.publicPath = `http://127.0.0.1:${baseConfig.port}`;
            return config;
        }
        return await baseConfig.webpackConfig(...args);
    },
    serverPackAll: true,
});
