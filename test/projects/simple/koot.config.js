const path = require('path');
const {
    moduleCssFilenameTest: defaultModuleCssFilenameTest,
} = require('koot/defaults/koot-config');

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
        '~base.less': path.resolve('./src/constants/less/base.less'),
        '~Assets': path.resolve('./src/assets'),
        '~/': path.resolve('./src'),
        react: path.resolve(__dirname, '../../../node_modules/react'),
    },
    staticCopyFrom: path.resolve(__dirname, './public'),
    icon: './src/assets/photo.jpg',
    // webApp: {
    //     themeColor: '#0092f5',
    // },

    port: 8081,
    // renderCache: true,

    webpackConfig: async () => {
        const ENV = process.env.WEBPACK_BUILD_ENV;
        if (ENV === 'dev') return await require('./config/webpack/dev')();
        if (ENV === 'prod') return await require('./config/webpack/prod')();
        return {};
    },

    webpackBefore: async (kootConfigWithExtra = {}) => {
        // eslint-disable-next-line no-console
        console.log('WEBPACK BEFORE');
        // console.log(kootConfigWithExtra);
    },
    // webpackBefore: async (kootConfigWithExtra = {}) => {
    //     const {
    //         __WEBPACK_OUTPUT_PATH,
    //         __CLIENT_ROOT_PATH
    //     } = kootConfigWithExtra;
    //     console.log('before', {
    //         __WEBPACK_OUTPUT_PATH,
    //         __CLIENT_ROOT_PATH
    //     });
    // },
    // webpackAfter: async (kootConfigWithExtra = {}) => {
    //     const {
    //         __WEBPACK_OUTPUT_PATH,
    //         __CLIENT_ROOT_PATH
    //     } = kootConfigWithExtra;
    //     console.log('after', {
    //         __WEBPACK_OUTPUT_PATH,
    //         __CLIENT_ROOT_PATH
    //     });
    // },
    classNameHashLength: 10,
    // bundleVersionsKeep: false,
    distClientAssetsDirName: '/\\test-includes\\/',
    moduleCssFilenameTest: [
        {
            test: /^((?!\.g\.).)*/,
            include: /biz-components/,
        },
        defaultModuleCssFilenameTest,
    ],
    internalLoaderOptions: {
        'less-loader': {
            lessOptions: {
                math: 'always',
            },
        },
    },

    // serverPackAll: true,
    // serverPackAll: false,
    // serverless: true,

    devPort: 3081,
    // devDll: [
    //     'react',
    //     'react-dom',
    //     'redux',
    //     'redux-thunk',
    //     'react-redux',
    //     'react-router',
    //     'react-router-redux',
    //     'koot'
    // ],
    devServer: {
        proxy: {
            // '/proxy-1': {
            //     target: 'http://10.60.204.111:8080',
            //     changeOrigin: true,
            //     pathRewrite: { '^/proxy-1': '' }
            // },
            '/proxy-1': {
                target: 'https://www.cmcm.com',
                changeOrigin: true,
                pathRewrite: { '^/proxy-1': '' },
            },
        },
    },
};
