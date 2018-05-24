const path = require('path')
const fs = require('fs-extra')
const webpack = require('webpack')
const ejs = require('ejs')
const chalk = require('chalk')

// const common = require('../common')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')

const writeChunkmap = require('../../../utils/write-chunkmap')

const factoryConfig = async ({
    // RUN_PATH,
    // CLIENT_DEV_PORT,
    // APP_KEY,
    localeId,
}) => ({
    mode: "production",
    target: 'web',
    // devtool: 'source-map',
    // entry: entries,
    // output: {
    //     filename: `[name].[chunkhash].js`,
    //     chunkFilename: `chunk.[name].[chunkhash].js`,
    //     path: outputPath,
    //     publicPath: publicPath
    // },
    optimization: {
        minimize: true,
    },
    plugins: [
        // 在node执行环境中设置，不起作用，此处不能省略
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            },
            __SPA__: true,
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     },
        //     beautify: false,
        //     comments: false,
        //     sourceMap: false
        // }),
        // new HtmlWebpackPlugin({
        //     filename: '../index.html',
        //     template: path.resolve(RUN_PATH, `./apps/${APP_KEY}/html.ejs`),
        //     inject: false,
        //     minify: {
        //         collapseWhitespace: true,
        //         collapseInlineTagWhitespace: true
        //     }
        // }),
        await new WebpackOnBuildPlugin(async (stats) => {
            const chunkmap = await writeChunkmap(stats, localeId)

            if (typeof process.env.SUPER_HTML_TEMPLATE !== 'string') {
                console.log(
                    chalk.red('× ')
                    + chalk.yellowBright('[super/build] ')
                    + 'template not exist'
                )
                return
            }

            const outputPath = stats.compilation.outputOptions.path
            const publicPath = stats.compilation.outputOptions.publicPath

            await fs.writeFile(
                path.resolve(outputPath, '../index.html'),
                ejs.render(
                    process.env.SUPER_HTML_TEMPLATE, {
                        inject: {
                            scriptsInHead: (() => `<!-- 11223344 -->`)()
                        }
                    }, {

                    }),
                'utf-8'
            )
        })
    ],
})

module.exports = async (opt) => await factoryConfig(opt)
