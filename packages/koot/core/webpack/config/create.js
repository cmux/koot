const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// Libs & Utilities
const getAppType = require('../../../utils/get-app-type')
const getPort = require('../../../utils/get-port')
const getChunkmapPathname = require('../../../utils/get-chunkmap-path')
const initNodeEnv = require('../../../utils/init-node-env')

// Transformers
const transformDist = require('./transform-dist')
const transformI18n = require('./transform-i18n')
const transformPWA = require('./transform-pwa')
const transformTemplate = require('./transform-template')
const transformConfigClient = require('./transform-config-client')
const transformConfigServer = require('./transform-config-server')

// Defaults & Data
const defaults = require('../../../defaults/build-config')

/**
 * 根据当前环境和配置，生成 Webpack 配置对象
 * @async
 * @param {Object} kootConfig Koot.js 打包配置对象 (koot.build.js)。具体内容详见模板项目的 koot.build.js 文件内注释。
 * @returns {Object} 生成的完整 Webpack 配置对象
 */
module.exports = async (kootConfig = {}) => {
    initNodeEnv()

    // 确定环境变量
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        // WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        // WEBPACK_ANALYZE,
        // SERVER_DOMAIN,
        // SERVER_PORT,
    } = process.env

    const defaultPublicDirName = 'includes'
    const defaultPublicPathname = (TYPE === 'spa' ? '' : '/') + `${defaultPublicDirName}/`

    // 抽取配置
    const data = Object.assign({}, defaults, kootConfig, {
        appType: await getAppType(),
        webpackConfig: {},
        defaultPublicDirName,
        defaultPublicPathname,
    })
    const {
        analyze = false
    } = data

    data.portServer = getPort(data.port)
    process.env.SERVER_PORT = data.portServer

    // ========================================================================
    //
    // 处理配置 - 公共
    //
    // ========================================================================

    data.dist = await transformDist(data.dist)
    data.i18n = await transformI18n(data.i18n)
    data.pwa = await transformPWA(data.pwa)
    data.template = await transformTemplate(data.template)
    data.pathnameChunkmap = await getChunkmapPathname()

    if (typeof data.config === 'function') data.config = await data.config()
    if (typeof data.config !== 'object') data.config = {}

    // ========================================================================
    //
    // 处理配置 - 客户端 / 开发 (CLIENT / DEV)
    //
    // ========================================================================

    if (STAGE === 'client')
        data.webpackConfig = await transformConfigClient(data)
    if (STAGE === 'server')
        data.webpackConfig = await transformConfigServer(data)

    // ========================================================================
    //
    // 模式: analyze
    //
    // ========================================================================

    if (analyze) {
        if (Array.isArray(data.webpackConfig))
            data.webpackConfig = data.webpackConfig[0]
        data.webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
                analyzerPort: process.env.SERVER_PORT,
                defaultSizes: 'gzip'
            })
        )
    }

    // ========================================================================
    //
    // 返回结果
    //
    // ========================================================================

    return data
}
