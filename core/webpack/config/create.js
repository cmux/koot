const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const createGlobalDefaultConfig = require('./create-global-default')
const createTargetDefaultConfig = require('./create-target-default')

// Libs & Utilities
const getAppType = require('../../../utils/get-app-type')
const getPort = require('../../../utils/get-port')
const getChunkmapPathname = require('../../../utils/get-chunkmap-path')
const log = require('../../../libs/log')

// Transformers
const transformDist = require('./transform-dist')
const transformI18n = require('./transform-i18n')
const transformPWA = require('./transform-pwa')
const transformTemplate = require('./transform-template')

// Defaults & Data
const common = require('../common')
const defaults = require('../../../defaults/build-config')

/**
 * 根据当前环境和配置，生成 Webpack 配置对象
 * @async
 * @param {Object} kootConfig Koot.js 打包配置对象 (koot.build.js)。具体内容详见模板项目的 koot.build.js 文件内注释。
 * @returns {Object} 生成的完整 Webpack 配置对象
 */
module.exports = async (kootConfig = {}) => {
    // 抽取配置
    let {
        config,
        dist,
        aliases,
        i18n,
        pwa,
        devServer,
        beforeBuild,
        afterBuild,
        port,
        defines,
        template,
        inject,
    } = Object.assign({}, defaults, kootConfig)

    // 确定项目类型
    const appType = await getAppType()

    // 确定服务器运行端口，并赋值到环境变量
    process.env.SERVER_PORT = getPort(port)

    // 确定环境变量
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        // WEBPACK_ANALYZE,
        WEBPACK_DEV_SERVER_PORT: CLIENT_DEV_PORT,
        // SERVER_DOMAIN,
        // SERVER_PORT,
    } = process.env

    // 确认默认的 publicPath
    const defaultPublicPath = (TYPE === 'spa' ? '' : '/') + `includes/`

    // Webpack 配置
    let webpackConfig = {}

    // DEBUG && console.log('============== Webpack Debug =============')
    // DEBUG && console.log('Webpack 打包环境：', TYPE, STAGE, ENV)
    log('build', __('build.build_start', {
        type: chalk.cyanBright(appType),
        stage: chalk.green(STAGE),
        env: chalk.green(ENV),
    }))

    // ========================================================================
    //
    // 处理配置
    //
    // ========================================================================

    dist = await transformDist(dist)
    i18n = await transformI18n(i18n)
    pwa = await transformPWA(pwa)
    template = await transformTemplate(template)

    const createGlobalDefault = await createGlobalDefaultConfig({
        aliases, defines
    })
    const pathnameChunkmap = getChunkmapPathname()
    const callbackArgs = {
        config,
        dist,
        aliases,
        i18n,
        pwa,
        devServer,
        port,
        defines,
        template,
        inject,
    }

    // TODO:
}
