require('../../../packages/koot/typedef');

const {
    KOOT_CLIENT_PUBLIC_PATH,
} = require('../../../packages/koot/defaults/envs');
const baseConfig = require('./koot.config');

const publicPath = `http://127.0.0.1:${baseConfig.port}`;

/** @type {AppConfig} */
module.exports = Object.assign({}, baseConfig, {
    [KOOT_CLIENT_PUBLIC_PATH]: publicPath,
    dist: './dist-spa-#249/',
    type: 'react-spa',
    bundleVersionsKeep: false,
    webpackConfig: async (...args) => {
        const config = await baseConfig.webpackConfig(...args);
        if (process.env.WEBPACK_BUILD_ENV === 'prod') {
            config.output.publicPath = publicPath;
            console.log(config);
        }
        return config;
    },
    historyType: 'browser',
});
