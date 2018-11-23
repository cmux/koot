process.env.DO_WEBPACK = true

//
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const resetCssLoader = require('./loaders/css/reset')

const {
    filenameWebpackDevServerPortTemp, keyFileProjectConfigTemp,
    keyConfigBuildDll,
    keyConfigQuiet,
    filenameBuilding, filenameBuildFail,
} = require('../../defaults/before-build')

const __ = require('../../utils/translate')
const spinner = require('../../utils/spinner')
const getDistPath = require('../../utils/get-dist-path')
const getAppType = require('../../utils/get-app-type')
// const getCwd = require('../../utils/get-cwd')
// const sleep = require('../../utils/sleep')

const _log = require('../../libs/log')
const elapse = require('../../libs/elapse.js')

const createWebpackConfig = require('./config/create')
const validateWebpackDevServerPort = require('./config/validate-webpack-dev-server-port')
const validateDist = require('./config/validate-dist')

const afterServerProd = require('./lifecyle/after-server-prod')
const cleanAndWriteLogFiles = require('./lifecyle/before/clean-and-write-log-files')

const createPWAsw = require('../pwa/create')


// 调试webpack模式
// const DEBUG = 1

// 程序启动路径，作为查找文件的基础
// const RUN_PATH = getCwd()

// 初始化环境变量
require('../../utils/init-node-env')()

// 用户自定义系统配置
// const SYSTEM_CONFIG = require('../../config/system')
// const DIST_PATH = require('')

process.env.DO_WEBPACK = false

/**
 * Webpack 打包
 * @async
 * @param {Object} kootBuildConfig
 * @param {Boolean} [kootBuildConfig.analyze=false] 是否为打包分析（analyze）模式
 * @returns {Object}
 */
module.exports = async (kootBuildConfig = {}) => {

    /**
     * @type {Object} 打包完成后返回的结果对象
     * @property {Boolean|Error[]} errors 发生的错误对象
     * @property {Boolean|String[]} warnings 发生的警告内容
     * @property {Function} addError 添加错误
     * @property {Function} addWarning 添加警告
     * @property {Function} hasError 是否有错误
     * @property {Function} hasWarning 是否有警告
     */
    const result = {
        errors: false,
        warnings: false,
    }
    Object.defineProperties(result, {
        addError: {
            value: (err) => {
                if (!Array.isArray(result.errors))
                    result.errors = []
                result.errors.push(!(err instanceof Error) ? new Error(err) : err)
            },
        },
        addWarning: {
            value: (warning) => {
                if (!Array.isArray(result.warnings))
                    result.warnings = []
                result.warnings.push(warning)
            },
        },
        hasError: {
            value: () => Array.isArray(result.errors),
        },
        hasWarning: {
            value: () => Array.isArray(result.warnings),
        },
    })










    // ========================================================================
    //
    // 先期准备
    //
    // ========================================================================

    /** @type {Number} 流程开始时间戳 */
    const timestampStart = Date.now()

    // 抽取配置
    let {
        beforeBuild,
        afterBuild,
        analyze = false,
        [keyConfigQuiet]: quietMode = false,
        [keyConfigBuildDll]: createDll = false,
    } = kootBuildConfig

    // 确定项目类型
    const appType = await getAppType()

    // 抽取环境变量
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        // WEBPACK_DEV_SERVER_PORT,
        KOOT_TEST_MODE,
    } = process.env
    const kootTest = JSON.parse(KOOT_TEST_MODE)

    // 开发环境下创建 DLL 模式时，默认为静音模式
    if (ENV === 'dev' && createDll) quietMode = true

    const log = (...args) => {
        if (quietMode) return
        return _log(...args)
    }

    // log: 打包流程正式开始
    log('build', __('build.build_start', {
        type: chalk.cyanBright(appType),
        stage: chalk.green(STAGE),
        env: chalk.green(ENV),
    }))

    /** @type {Function} @async 流程回调: webpack 执行前 */
    const before = async () => {
        const dist = getDistPath()

        // 开发模式
        if (ENV === 'dev') {
            // 确保 server/index.js 存在
            fs.ensureFileSync(path.resolve(dist, `./server/index.js`))
        }

        log('callback', 'build', `callback: ` + chalk.green('beforeBuild'))

        // 清除遗留文件
        const filesToRemove = [
            filenameBuilding,
            filenameBuildFail,
        ]
        for (let filename of filesToRemove) {
            const file = path.resolve(dist, filename)
            if (fs.existsSync(file))
                await fs.remove(file)
        }

        // 创建空文件标记
        fs.ensureFileSync(path.resolve(dist, filenameBuilding))

        // 创建 DLL 模式下不执行传入的生命周期方法
        if (!createDll && typeof beforeBuild === 'function')
            await beforeBuild(data)
    }

    /** @type {Function} @async 流程回调: webpack 执行后 */
    const after = async () => {
        const dist = getDistPath()

        if (!quietMode) console.log(' ')

        if (!analyze && pwa && STAGE === 'client' && ENV === 'prod') {
            // 生成PWA使用的 service-worker.js
            await createPWAsw(pwa, i18n)
        }

        if (STAGE === 'server' && ENV === 'prod') {
            // 生成PWA使用的 service-worker.js
            await afterServerProd(data)
        }

        // 清除遗留文件
        const filesToRemove = [
            filenameBuilding,
            filenameBuildFail
        ]
        for (let filename of filesToRemove) {
            const file = path.resolve(dist, filename)
            if (fs.existsSync(file))
                await fs.remove(file)
        }

        log('callback', 'build', `callback: ` + chalk.green('afterBuild'))

        // 创建 DLL 模式下不执行传入的生命周期方法
        if (!createDll && typeof afterBuild === 'function')
            await afterBuild(data)

        // 标记完成
        log('success', 'build', __('build.build_complete', {
            type: chalk.cyanBright(appType),
            stage: chalk.green(STAGE),
            env: chalk.green(ENV),
        }))

        // await sleep(20 * 1000)
        // console.log(`  > start: ${timestampStart}`)
        // console.log(`  > end: ${Date.now()}`)
        // console.log(`  > ms: ${Date.now() - timestampStart}`)
        if (!quietMode)
            console.log(`  > ~${elapse(Date.now() - timestampStart)} @ ${(new Date()).toLocaleString()}`)

        return
    }

    /** @type {Function} @async 在每次打包前均会执行的方法。如 webpack 为 Array 时，针对每个打包执行开始前。before() 仅针对整体打包流程 */
    const beforeEachBuild = async () => {
        // 重置数据
        resetCssLoader()
    }










    // ========================================================================
    //
    // 最优先流程
    //
    // ========================================================================

    // 开发模式: 确定 webpack-dev-server 端口号
    if (ENV === 'dev') {
        // 尝试读取记录端口号的临时文件
        const dist = await validateDist(kootBuildConfig.dist)
        const pathnameTemp = path.resolve(dist, filenameWebpackDevServerPortTemp)
        const getExistResult = async () => {
            if (fs.existsSync(pathnameTemp)) {
                const content = await fs.readFile(pathnameTemp)
                if (!isNaN(content))
                    return parseInt(content)
            }
            return undefined
        }
        const existResult = await getExistResult()
        if (existResult) {
            process.env.WEBPACK_DEV_SERVER_PORT = existResult
        } else {
            // 如果上述临时文件不存在，从配置中解析结果
            process.env.WEBPACK_DEV_SERVER_PORT = await validateWebpackDevServerPort(kootBuildConfig.port)
            // 将 webpack-dev-server 端口写入临时文件
            await fs.writeFile(
                pathnameTemp,
                process.env.WEBPACK_DEV_SERVER_PORT,
                'utf-8'
            )
        }
    }










    // ========================================================================
    //
    // 创建对应当前环境的 Webpack 配置
    //
    // ========================================================================
    const data = await createWebpackConfig(Object.assign(kootBuildConfig, {
        afterBuild: after
    })).catch(err => {
        console.error('生成打包配置时发生错误! \n', err)
    })
    const {
        webpackConfig,
        pwa,
        i18n,
        devServer,
        pathnameChunkmap,
    } = data

    if (TYPE === 'spa' && typeof !!kootBuildConfig.i18n) {
        log('error', 'build', chalk.redBright(__('build.spa_i18n_disabled_temporarily')))
    } else if (typeof i18n === 'object') {
        if (STAGE === 'client') {
            log('success', 'build',
                `i18n ` + chalk.yellowBright(`enabled`)
            )
            if (!quietMode) console.log(`  > type: ${chalk.yellowBright(i18n.type)}`)
            if (!quietMode) console.log(`  > locales: ${i18n.locales.map(arr => arr[0]).join(', ')}`)
        }
        if (ENV === 'dev' && i18n.type === 'default') {
            if (!quietMode) console.log(`  > We recommend using ${chalk.greenBright('redux')} mode in DEV enviroment.`)
        }
    }










    // ========================================================================
    //
    // 准备执行打包
    //
    // ========================================================================

    await before()

    const spinnerBuilding = (!kootTest && !quietMode)
        ? spinner(chalk.yellowBright('[koot/build] ') + __('build.building'))
        : undefined
    const buildingComplete = () => {
        if (spinnerBuilding) {
            if (result.hasError()) {
                spinnerBuilding.fail()
            } else {
                spinnerBuilding.stop()
            }
        }
    }

    /**
     * 打包过程出错处理
     * @param {Error|String} err 
     */
    const buildingError = (err) => {
        // 移除过程中创建的临时文件
        if (data[keyFileProjectConfigTemp]) {
            const pathnameTemp = path.resolve(data.dist, data[keyFileProjectConfigTemp])
            if (fs.existsSync(pathnameTemp))
                fs.removeSync(pathnameTemp)
        }

        // 将错误添加入结果对象
        result.addError(err)

        // 将错误写入文件
        const fileFail = path.resolve(data.dist, filenameBuildFail)
        fs.ensureFileSync(fileFail)
        fs.writeFileSync(
            fileFail,
            result.errors.join('\r\n\r\n'),
            'utf-8'
        )

        // 移除标记文件
        const fileBuilding = path.resolve(data.dist, filenameBuilding)
        if (fs.existsSync(fileBuilding))
            fs.removeSync(fileBuilding)

        // 返回结果对象
        return result
    }

    // 处理日志文件
    await cleanAndWriteLogFiles(webpackConfig, {
        quietMode, createDll
    })

    // if (Array.isArray(webpackConfig)) {
    //     webpackConfig.forEach(config => console.log(config.module.rules))
    // } else {
    //     console.log(webpackConfig.module.rules)
    // }









    // ========================================================================
    //
    // 执行打包
    //
    // ========================================================================
    // if (STAGE === 'client' && ENV === 'dev' && createDll) {
    //     buildingComplete()
    //     await after()
    //     return result
    // }

    // CLIENT / DEV
    if (STAGE === 'client' && ENV === 'dev' && !createDll) {
        // await sleep(20 * 1000)
        await beforeEachBuild()
        const compiler = webpack(webpackConfig)
        const devServerConfig = Object.assign({
            quiet: false,
            stats: { colors: true },
            clientLogLevel: 'error',
            hot: true,
            inline: true,
            historyApiFallback: true,
            contentBase: './',
            publicPath: TYPE === 'spa' ? '/' : '/dist/',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            open: TYPE === 'spa',
            watchOptions: {
                // aggregateTimeout: 20 * 1000,
                ignored: [
                    // /node_modules/,
                    // 'node_modules',
                    getDistPath(),
                    path.resolve(getDistPath(), '**/*')
                ]
            },
            before: (app) => {
                if (appType === 'ReactSPA') {
                    require('../../ReactSPA/dev-server/extend')(app)
                }
            }
        }, devServer)
        const port = TYPE === 'spa' ? process.env.SERVER_PORT : process.env.WEBPACK_DEV_SERVER_PORT

        // more config
        // http://webpack.github.io/docs/webpack-dev-server.html
        const server = await new WebpackDevServer(compiler, devServerConfig)
        server.use(require('webpack-hot-middleware')(compiler))
        server.listen(port, '0.0.0.0', async (err) => {
            if (err) console.error(err)
            buildingComplete()
            // await after()
        })

        return result
    }

    // CLIENT / PROD
    if (STAGE === 'client'/* && ENV === 'prod'*/) {
        // process.env.NODE_ENV = 'production'
        if (!fs.existsSync(pathnameChunkmap) && !createDll) {
            await fs.ensureFile(pathnameChunkmap)
            await fs.writeJson(
                pathnameChunkmap,
                {},
                {
                    spaces: 4
                }
            )
        }

        // 执行打包
        const build = async (config, onComplete = buildingComplete) => {
            await beforeEachBuild()
            const compiler = webpack(config)
            // console.log('compiler')
            await new Promise((resolve, reject) => {
                compiler.run(async (err, stats) => {
                    const info = stats.toJson()

                    if (stats.hasWarnings()) {
                        result.addWarning(info.warnings)
                    }

                    if (stats.hasErrors()) {
                        onComplete()
                        console.log(stats.toString({
                            chunks: false,
                            colors: true
                        }))
                        reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${info.errors}`)
                        return buildingError(info.errors)
                    }

                    if (err) {
                        onComplete()
                        reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)
                        return buildingError(err)
                    }

                    onComplete()

                    // 非分析模式: log stats
                    if (!analyze && !quietMode) {
                        console.log(stats.toString({
                            chunks: false, // 输出精简内容
                            colors: true
                        }))
                    }

                    setTimeout(() => resolve(), 10)
                })
            })
        }

        if (Array.isArray(webpackConfig)) {
            buildingComplete()
            // console.log(' ')
            // let index = 0
            for (let config of webpackConfig) {
                const localeId = config.plugins
                    .filter(plugin => typeof plugin.localeId === 'string')
                    .reduce((prev, cur) => cur.localeId)
                const spinnerBuildingSingle = (!kootTest && !quietMode)
                    ? spinner(
                        (chalk.yellowBright('[koot/build] ') + __('build.building_locale', {
                            locale: localeId
                        })).replace(new RegExp(' ' + localeId + '\\)'), ` ${chalk.green(localeId)})`)
                    )
                    : undefined
                await build(config, () => {
                    if (spinnerBuildingSingle) {
                        if (result.hasError()) {
                            spinnerBuildingSingle.fail()
                        } else {
                            spinnerBuildingSingle.stop()
                            setTimeout(() => {
                                console.log(' ')
                                log('success', 'build', chalk.green(`${localeId}`))
                            })
                        }
                    }
                })
                // index++
            }
        } else {
            await build(webpackConfig)
            // console.log(' ')
        }

        await after()
        return result
    }

    // if (STAGE === 'server' && ENV === 'dev' && createDll) {
    //     buildingComplete()
    //     console.log(123123123)
    //     await after()
    //     return result
    // }

    // 服务端开发环境
    if (STAGE === 'server' && ENV === 'dev' && !createDll) {
        await beforeEachBuild()
        await webpack(
            webpackConfig,
            async (err, stats) => {
                buildingComplete()

                if (err)
                    throw new Error(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)

                console.log(stats.toString({
                    chunks: false,
                    colors: true
                }))

                await after()
            }
        )

        return
    }

    // 服务端打包
    if (STAGE === 'server'/* && ENV === 'prod'*/) {
        // process.env.NODE_ENV = 'production'
        // process.env.WEBPACK_SERVER_PUBLIC_PATH =
        //     (typeof webpackConfigs.output === 'object' && webpackConfigs.output.publicPath)
        //         ? webpackConfigs.output.publicPath
        //         : ''

        // 确定 chunkmap
        // 如果没有设定，创建空文件
        if (!fs.pathExistsSync(pathnameChunkmap)) {
            await fs.ensureFile(pathnameChunkmap)
            process.env.WEBPACK_CHUNKMAP = ''
            // console.log(chalk.green('√ ') + chalk.greenBright('Chunkmap') + ` file does not exist. Crated an empty one.`)
        } else {
            try {
                process.env.WEBPACK_CHUNKMAP = JSON.stringify(await fs.readJson(pathnameChunkmap))
            } catch (e) {
                process.env.WEBPACK_CHUNKMAP = ''
            }
        }

        await beforeEachBuild()
        await new Promise((resolve, reject) => {
            webpack(webpackConfig, async (err, stats) => {
                const info = stats.toJson()

                if (stats.hasWarnings()) {
                    result.addWarning(info.warnings)
                }

                if (stats.hasErrors()) {
                    buildingComplete()
                    console.log(stats.toString({
                        chunks: false,
                        colors: true
                    }))
                    reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${info.errors}`)
                    return buildingError(info.errors)
                }

                if (err) {
                    buildingComplete()
                    reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)
                    return buildingError(err)
                }

                buildingComplete()
                if (!quietMode) console.log(' ')

                if (!analyze && !quietMode)
                    console.log(stats.toString({
                        chunks: false, // Makes the build much quieter
                        colors: true
                    }))

                resolve()
            })
        })

        await after()

        return result
    }

    return result
}
