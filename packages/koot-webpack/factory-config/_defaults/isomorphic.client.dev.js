const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const factoryConfig = async ({
    // RUN_PATH,
    clientDevServerPort,
    localeId
}) => {
    // let { RUN_PATH, clientDevServerPort, APP_KEY } = opt

    return {
        mode: 'development',
        target: 'web',
        devtool: 'cheap-module-eval-source-map',
        output: {
            // -_-_-_-_-_- is trying to fix a pm2 bug that will currupt [name] value
            // check enter.js for the fix
            filename:
                (localeId ? localeId : '') +
                `.entry.-_-_-_-_-_-[chunkhash]-_-_-_-_-_-.js`,
            chunkFilename:
                (localeId ? localeId : '') +
                `.chunk.-_-_-_-_-_-[chunkhash]-_-_-_-_-_-.js`,
            path: '/',
            publicPath: `http://localhost:${clientDevServerPort}/dist/`,
            pathinfo: false,
            crossOriginLoading: 'anonymous'
        },
        plugins: [
            // 在node执行环境中设置，不起作用，此处不能省略
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('development')
                },
                __SPA__: false
            }),
            new MiniCssExtractPlugin({
                // filename: (localeId ? localeId : '') + ".[name].css",
                filename:
                    (localeId ? localeId : '') + '.extract.[id].[chunkhash].css'
                // chunkFilename: "[id].css"
            })
        ]
    };
};

module.exports = async opt => await factoryConfig(opt);
