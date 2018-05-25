const path = require('path')
const fs = require('fs-extra')
const webpack = require('webpack')
const ejs = require('ejs')
const chalk = require('chalk')

// const common = require('../common')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const writeChunkmap = require('../../../utils/write-chunkmap')
const inject = require('../../../ReactSPA/inject')

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
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].[chunkhash].css",
            // chunkFilename: "[id].css"
        }),
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
            await writeChunkmap(stats, localeId)
        })
    ],
})

module.exports = async (opt) => await factoryConfig(opt)

