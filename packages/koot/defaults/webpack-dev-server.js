module.exports = {
    publicPathPrefix: '__koot_webpack_dev_server__',
    entryClientHMR: 'webpack-dev-server-client',

    serviceWorkerFilename: '__KOOT_DEV_SERVICE_WORKER__.js',

    hmrOptions: {
        // multiStep: true,
        // fullBuildTimeout: process.env.WEBPACK_BUILD_TYPE === 'spa' ? 500 : undefined,
        // requestTimeout: process.env.WEBPACK_BUILD_TYPE === 'spa' ? undefined : 1000
    }
};
