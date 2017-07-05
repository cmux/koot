const path = require('path')
const fs = require('fs-extra')

const webpack = require('webpack')
const common = require('./common')

const getConfig = (appPath, port, type) => {
    const entries = require('./client-entries.js')(appPath, type)
    const outputPath = path.resolve(appPath, `dist/public/client${type ? ('/' + type) : ''}`)
    const publicPath = `http://localhost:${port}/dist${type ? ('/' + type) : ''}/`

/*    if (type === 'portals') {
        fs.writeFileSync(
            path.resolve(appPath, './src/server/app-plus/views/plus-index.ejs'),
            fs.readFileSync(path.resolve(appPath, './src/server/app-plus/views/src/template.ejs'), 'utf-8')
                .replace(/\<\%\= publicPath \%\>/g, publicPath),
            'utf-8'
        )
    }*/

    let config = {
        target: 'web',
        devtool: 'source-map',
        entry: entries,
        output: {
            filename: '[name].js',
            chunkFilename: type !== 'portals' ? 'chunk.[name].[chunkhash].js' : 'chunk.[name].js',
            path: outputPath,
            publicPath: publicPath
        },
        module: {
            rules: [...common.rules]
        },
        plugins: [
            // 在node执行环境中设置，不起作用，此处不能省略
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('development')
                }
            }),
            new webpack.DefinePlugin({
                '__CLIENT__': true,
                '__SERVER__': false,
                '__DEV__': false,
                '__CLIENTPORT__': JSON.stringify(port)
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            ...common.plugins,

        ],
        resolve: common.resolve
    }

    return config
}

module.exports = (appPath, port) => [
    getConfig(appPath, port)
    // getConfig(appPath, port, 'portals')
]