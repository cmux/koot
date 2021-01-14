const webpack = require('webpack');
const common = require('../common');

const factoryConfig = async ({
    pathRun,
    // CLIENT_DEV_PORT,
}) => {
    // let { RUN_PATH, CLIENT_DEV_PORT, APP_KEY } = opt

    return {
        mode: 'development',
        devtool: 'source-map',
        target: 'async-node',
        node: {
            __dirname: true,
        },
        // watch: false,
        output: {
            filename: '[name].js',
            chunkFilename: 'chunk.[chunkhash].js',
            path: `${pathRun}/${common.outputPath}/.server`,
            // publicPath: `/[need_set_in_app:__webpack_public_path__]/`,
            // publicPath: `/`,
        },
        plugins: [
            new webpack.DefinePlugin({
                __SPA__: true,
            }),
        ],
        externals: common.filterExternalsModules(),
    };
};

module.exports = async (opt) => await factoryConfig(opt);
