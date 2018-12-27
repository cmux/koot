const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const DefaultWebpackConfig = require('webpack-config').default
// const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin').default

const CopyWebpackPlugin = require('copy-webpack-plugin')
const KootI18nPlugin = require('../plugins/i18n')
const DevModePlugin = require('koot-webpack/plugins/dev-mode')

const createTargetDefaultConfig = require('./create-target-default')
const transformConfigExtendDefault = require('./transform-config-extend-default')
const transformConfigLast = require('./transform-config-last')
const transformOutputPublicpath = require('./transform-output-publicpath')

const getCwd = require('../../../utils/get-cwd')
const getDirDistPublic = require('../../../libs/get-dir-dist-public')

/**
 * Webpack 配置处理 - 服务器端配置
 * @async
 * @param {Object} kootBuildConfig 
 * @returns {Object} 处理后的配置
 */
module.exports = async (kootBuildConfig = {}) => {
    const {
        webpackConfig: config = {},
        appType,
        dist,
        defaultPublicPathname,
        i18n,
        staticCopyFrom: staticAssets,
    } = kootBuildConfig

    const {
        // WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        WEBPACK_DEV_SERVER_PORT: clientDevServerPort,
    } = process.env

    const configTargetDefault = await createTargetDefaultConfig({
        pathRun: getCwd(),
        clientDevServerPort,
    })

    /** @type {Object} 当前环境的 webpack 配置对象 */
    const result = new DefaultWebpackConfig()
        .merge(configTargetDefault)
        .merge(config)

    await transformConfigExtendDefault(result, kootBuildConfig)

    Object.assign(result.output, configTargetDefault.output)

    // 如果用户自己配置了服务端打包路径，则覆盖默认的
    if (dist)
        result.output.path = path.resolve(dist, './server')
    if (!result.output.publicPath)
        result.output.publicPath = defaultPublicPathname
    if (!result.output.filename)
        result.output.filename = 'entry.[chunkhash].js'
    if (!result.output.chunkFilename)
        result.output.chunkFilename = 'chunk.[chunkhash].js'

    result.output.publicPath = transformOutputPublicpath(result.output.publicPath)

    result.plugins.unshift(
        new KootI18nPlugin({
            stage: STAGE,
            functionName: i18n ? i18n.expr : undefined,
        })
    )
    result.plugins.unshift(
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    )

    if (ENV === 'dev') {
        if (i18n && Array.isArray(i18n.locales) && i18n.locales.length > 0)
            result.plugins.push(new CopyWebpackPlugin(
                i18n.locales.map(arr => ({
                    from: arr[2],
                    to: '../.locales/'
                }))
            ))

        result.watchOptions = {
            ignored: [
                // /node_modules/,
                // 'node_modules',
                dist,
                path.resolve(dist, '**/*')
            ]
        }
    }

    // entry / 入口
    const entryIndex = [
        // '@babel/register',
        '@babel/polyfill',
        // path.resolve(__dirname, '../../../defaults/server-stage-0.js'),
        path.resolve(__dirname, '../../../', appType, './server')
    ]
    const otherEntries = {}
    const fileSSR = path.resolve(__dirname, '../../../', appType, './server/ssr.js')
    if (fs.existsSync(fileSSR)) {
        otherEntries.ssr = [fileSSR]
        // result.plugins.push(
        //     new ExtraWatchWebpackPlugin({
        //         files: [
        //             fileSSR,
        //             fileSSR.replace(/\.js$/, '.hot-update.js')
        //         ]
        //     })
        // )
    }
    if (ENV === 'dev') {
        Object.keys(otherEntries).forEach(key => {
            otherEntries[key].push('webpack/hot/poll?1000')
        })
    }

    // 覆盖 optimization
    {
        result.optimization = {
            splitChunks: false,
            removeAvailableModules: false,
            removeEmptyChunks: false,
            mergeDuplicateChunks: false,
            occurrenceOrder: false,
            concatenateModules: false,
        }
    }

    // 拆分
    const configsFull = [
        {
            ...result,
            entry: {
                index: entryIndex
            },
            output: {
                ...result.output,
                filename: 'index.js'
            }
        }
    ]
    Object.keys(otherEntries).forEach(entryName => {
        configsFull.push({
            ...result,
            entry: {
                [entryName]: otherEntries[entryName]
            },
            output: {
                ...result.output,
                filename: `${entryName}.js`
            }
        })
    });

    // 对最后一个配置进行加工
    ((config) => {
        if (ENV === 'dev') {
            if (typeof staticAssets === 'string')
                config.plugins.push(new CopyWebpackPlugin([
                    {
                        from: staticAssets,
                        to: path.relative(config.output.path, getDirDistPublic(dist))
                    }
                ]))

            config.plugins.push(
                new DevModePlugin({ dist })
            )
        }
    })(configsFull[configsFull.length - 1])


    //


    return await transformConfigLast(configsFull, kootBuildConfig)
}
