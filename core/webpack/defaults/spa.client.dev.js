const webpack = require('webpack')

const factoryConfig = async ({
    // RUN_PATH,
    // CLIENT_DEV_PORT,
    // APP_KEY,
    localeId,
}) => ({
    mode: "development",
    target: 'web',
    devtool: 'source-map',
    output: {
        // -_-_-_-_-_- is trying to fix a pm2 bug that will currupt [name] value
        // check enter.js for the fix
        filename: (localeId ? localeId : '') + `.-_-_-_-_-_-[name]-_-_-_-_-_-.js`,
        chunkFilename: (localeId ? localeId : '') + `.chunk.-_-_-_-_-_-[name]-_-_-_-_-_-.js`,
        path: '/',
        publicPath: `/`
    },
    plugins: [
        // 在node执行环境中设置，不起作用，此处不能省略
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            },
            __SPA__: true,
        }),
    ],
})

module.exports = async (opt) => await factoryConfig(opt)
