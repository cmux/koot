const path = require('path')
const DefaultWebpackConfig = require('webpack-config').default

const KootI18nPlugin = require('../plugins/i18n')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const createTargetDefaultConfig = require('./create-target-default')
const transformConfigExtendDefault = require('./transform-config-extend-default')
const transformConfigLast = require('./transform-config-last')

const getCwd = require('../../../utils/get-cwd')

/**
 * Webpack 配置处理 - 服务器端配置
 * @async
 * @param {Object} data 
 * @returns {Object} 处理后的配置
 */
module.exports = async (data = {}) => {
    const {
        config = {},
        appType,
        dist,
        defaultPublicPathname,
        i18n,
    } = data

    const {
        // WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        WEBPACK_DEV_SERVER_PORT: clientDevServerPort,
    } = process.env

    const defaultServerEntry = [
        '@babel/register',
        '@babel/polyfill',
        path.resolve(__dirname, '../../../defaults/server-stage-0.js'),
        path.resolve(
            __dirname,
            '../../../',
            appType,
            './server'
        )
    ]
    if (ENV === 'dev') defaultServerEntry.push('webpack/hot/poll?1000')

    const configTargetDefault = await createTargetDefaultConfig({
        pathRun: getCwd(),
        clientDevServerPort,
    })

    const result = new DefaultWebpackConfig()
        .merge(configTargetDefault)
        .merge(config)

    await transformConfigExtendDefault(result, data)

    Object.assign(result.output, configTargetDefault.output)

    // 如果用户自己配置了服务端打包路径，则覆盖默认的
    if (dist)
        result.output.path = path.resolve(dist, './server')
    if (!result.output.publicPath)
        result.output.publicPath = defaultPublicPathname

    result.plugins.unshift(
        new KootI18nPlugin({
            stage: STAGE,
            functionName: i18n ? i18n.expr : undefined,
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
    }

    result.entry = defaultServerEntry

    return await transformConfigLast(result)

    // return result
}
