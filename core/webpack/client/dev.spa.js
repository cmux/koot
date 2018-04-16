// temp 没有用于真实使用，后续会增加spa的调试情况
// diablohu: 目前有一个场景：只开webpack dev server的SPA开发
// 目前文件存在目的只是方便编译


const path = require('path')
const fs = require('fs-extra')

const webpack = require('webpack')
const common = require('../common')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
const opn = require('opn')

const times = n => f => {
    let iter = i => {
        if (i === n) return
        f(i)
        iter(i + 1)
    }
    return iter(0)
}

let isOpened = false

const factoryConfig = async(opt) => {

    let { RUN_PATH, CLIENT_DEV_PORT, APP_KEY } = opt

    console.log(opt)

    let config = {
        target: 'web',
        devtool: 'source-map',
        // entry: entries,
        // output: {
        //     filename: `[name].[chunkhash].js`,
        //     chunkFilename: `chunk.[name].[chunkhash].js`,
        //     path: outputPath,
        //     publicPath: publicPath
        // },
        output: {
            // -_-_-_-_-_- is trying to fix a pm2 bug that will currupt [name] value
            // check enter.js for the fix
            filename: `${APP_KEY}.-_-_-_-_-_-[name]-_-_-_-_-_-.js`,
            chunkFilename: `${APP_KEY}.chunk.-_-_-_-_-_-[name]-_-_-_-_-_-.js`,
            path: '/',
            // publicPath: `http://localhost:${CLIENT_DEV_PORT}/${APP_KEY}/`
            publicPath: `/${APP_KEY}/`
        },
        plugins: [
            // 在node执行环境中设置，不起作用，此处不能省略
            // new webpack.DefinePlugin({
            //     'process.env': {
            //         'NODE_ENV': JSON.stringify('production')
            //     }
            // }),
            // new webpack.NoEmitOnErrorsPlugin(),
            // new webpack.optimize.UglifyJsPlugin({
            //     compress: {
            //         warnings: false
            //     },
            //     beautify: false,
            //     comments: false,
            //     sourceMap: false
            // }),
            new HtmlWebpackPlugin({
                // filename: '../index.html',
                filename: 'index.html',
                template: path.resolve(RUN_PATH, `./apps/${APP_KEY}/html.ejs`),
                inject: 'body',
                chunks: [
                    'client'
                ],
                __DEV__: true
            }),
            new WebpackOnBuildPlugin(function () {
                if (!isOpened) {
                    opn(`http://localhost:${CLIENT_DEV_PORT}/${APP_KEY}/index.html`)
                    isOpened = true
                }
            })
        ],
    }

    return config
}
module.exports = async(opt) => await factoryConfig(opt)