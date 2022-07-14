const webpack = require('webpack');
const common = require('../common');

const { hmrOptions } = require('koot/defaults/webpack-dev-server');

const factoryConfig = async ({ pathRun, clientDevServerPort }) => {
    // let { RUN_PATH, CLIENT_DEV_PORT, APP_KEY } = opt

    // 此处引用 Webpack dev server 的文件，动态打包更新
    const publicPath = `http://localhost:${clientDevServerPort}/dist`;

    return {
        mode: 'development',
        devtool: 'cheap-module-source-map',
        target: 'async-node',
        node: {
            __dirname: true,
        },
        // watch: true,
        output: {
            filename: '[name].js',
            chunkFilename: 'chunk.-_-_-_-_-_-[chunkhash]-_-_-_-_-_-.js',
            path: `${pathRun}/${common.outputPath}/server`,
            publicPath: `${publicPath}/`,
            pathinfo: false,
        },
        plugins: [
            new webpack.DefinePlugin({
                __SPA__: false,
            }),
            new webpack.HotModuleReplacementPlugin(hmrOptions),
        ],
        externals: common.filterExternalsModules(),
    };
};

module.exports = async (opt) => await factoryConfig(opt);
