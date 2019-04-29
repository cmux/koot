const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const factoryConfig = async (/*{
    runPath,
    clientDevPort,
    localeId,
}*/) => {

    return {
        mode: "production",
        target: 'web',
        // devtool: 'source-map',
        optimization: {
            minimize: true,
            noEmitOnErrors: true,
        },
        plugins: [
            // 在node执行环境中设置，不起作用，此处不能省略
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                },
                __SPA__: false,
            }),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                // filename: "[name].[chunkhash].css",
                filename: "extract.[id].[chunkhash].css",
                // chunkFilename: "[id].css"
            }),
        ],
    }
}

module.exports = factoryConfig
