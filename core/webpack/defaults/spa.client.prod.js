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
const getChunkmap = require('../../../utils/get-chunkmap')
const getClientFilePath = require('../../../utils/get-client-file-path')
const readClientFile = require('../../../utils/read-client-file')

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
    output: {
        // filename: `[name].[chunkhash].js`,
        // chunkFilename: `chunk.[name].[chunkhash].js`,
        // path: 'includes',
        // publicPath: 'includes/',
    },
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

            const {
                // WEBPACK_BUILD_ENV: ENV,
                SUPER_DIST_DIR: dist,
            } = process.env
            const outputPath = stats.compilation.outputOptions.path
            const publicPath = stats.compilation.outputOptions.publicPath
            const file = `index${localeId ? `.${localeId}` : ''}.html`

            // console.log(path.resolve(outputPath, './index.html'))

            await fs.writeFile(
                path.resolve(dist, 'public/', file),
                ejs.render(
                    process.env.SUPER_HTML_TEMPLATE, {
                        inject: inject({ localeId })
                    }, {

                    }
                ),
                'utf-8'
            )
            console.log(
                chalk.green('√ ')
                + chalk.yellowBright('[super/build] ')
                + 'template output to '
                + chalk.green(`/${file}`)
            )
        })
    ],
})

module.exports = async (opt) => await factoryConfig(opt)

const inject = (settings = {}) => {
    const {
        localeId,
        stats,
    } = settings
    const {
        WEBPACK_BUILD_ENV: ENV,
    } = process.env

    const chunkmap = ENV === 'prod' ? getChunkmap(localeId) : {}

    return {
        stylesInHead: (() => {
            if (ENV === 'prod') {
                return (Array.isArray(chunkmap.critical) ? `<style type="text/css">${readClientFile('critical.css')}</style>` : '')
            }
            if (ENV === 'dev') {
                return '<!-- TODO: -->'
            }
        })(),
        scriptsInBody: (() => {
            if (ENV === 'prod') {
                let r = `<script type="text/javascript">`
                    + `var __REDUX_STATE__ = {};`
                    + (Array.isArray(chunkmap.critical) ? readClientFile('critical.js') : '')
                    + `</script>`
                if (typeof chunkmap['.entrypoints'] === 'object') {
                    const entries = chunkmap['.entrypoints']
                    Object.keys(entries).filter(key => (
                        key !== 'critical'
                    )).forEach(key => {
                        if (Array.isArray(entries[key])) {
                            entries[key].forEach(file => {
                                r += `<script type="text/javascript" src="${
                                    file.replace(/(^\.\/|^)public\//, '')
                                }" defer></script>`
                            })
                        }
                    })
                }
                return r
            }
            if (ENV === 'dev') {
                return '<!-- TODO: -->'
            }
        })()
    }
}
