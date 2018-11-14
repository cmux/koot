module.exports = {

    publicPathPrefix: '__koot_webpack_dev_server__',
    entryClientHMR: 'webpack-dev-server-client',

    hmrOptions: {
        multiStep: true,
        // fullBuildTimeout: 0.5 * 1000,
        requestTimeout: 1000
    },

}
