const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const factoryConfig = async (/*{
    // RUN_PATH,
    // CLIENT_DEV_PORT,
    // APP_KEY,
    localeId,
}*/) => ({
    mode: 'production',
    target: 'web',
    // devtool: 'source-map',
    plugins: [
        // 在node执行环境中设置，不起作用，此处不能省略
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            },
            __SPA__: true
        }),
        new MiniCssExtractPlugin({
            // filename: "[name].[chunkhash].css",
            filename: 'extract.[id].[chunkhash].css'
            // chunkFilename: "[id].css"
        })
    ]
});

module.exports = async opt => await factoryConfig(opt);
