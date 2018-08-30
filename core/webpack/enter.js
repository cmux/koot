process.env.DO_WEBPACK = true

//
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const WebpackConfig = require('webpack-config').default
const CopyWebpackPlugin = require('copy-webpack-plugin')

const __ = require('../../utils/translate')
const spinner = require('../../utils/spinner')
const getDistPath = require('../../utils/get-dist-path')
const getAppType = require('../../utils/get-app-type')
const getCwd = require('../../utils/get-cwd')

const log = require('../../libs/log')

const createWebpackConfig = require('./config/create')
const createPWAsw = require('../pwa/create')
const KootI18nPlugin = require("./plugins/i18n")

const afterServerProd = require('./lifecyle/after-server-prod')


// 调试webpack模式
// const DEBUG = 1

// 程序启动路径，作为查找文件的基础
const RUN_PATH = getCwd()

// 初始化环境变量
require('../../utils/init-node-env')()

// 用户自定义系统配置
// const SYSTEM_CONFIG = require('../../config/system')
// const DIST_PATH = require('')

process.env.DO_WEBPACK = false

/**
 * Webpack 运行入口方法
 */
module.exports = async (kootConfig) => {
    const timestampStart = Date.now()

    // 抽取配置
    let {
        beforeBuild,
        afterBuild,
    } = kootConfig

    // 确定项目类型
    const appType = await getAppType()

    // 确定环境变量
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        WEBPACK_DEV_SERVER_PORT: CLIENT_DEV_PORT,
    } = process.env

    // DEBUG && console.log('============== Webpack Debug =============')
    // DEBUG && console.log('Webpack 打包环境：', TYPE, STAGE, ENV)
    log('build', __('build.build_start', {
        type: chalk.cyanBright(appType),
        stage: chalk.green(STAGE),
        env: chalk.green(ENV),
    }))

    const before = async () => {
        if (ENV === 'dev') fs.ensureFileSync(path.resolve(getDistPath(), `./server/index.js`))
        log('callback', 'build', `callback: ` + chalk.green('before'))
        if (typeof beforeBuild === 'function') await beforeBuild(data)
    }

    const after = async () => {
        console.log(' ')

        if (pwa && STAGE === 'client' && ENV === 'prod') {
            // 生成PWA使用的 service-worker.js
            await createPWAsw(pwa, i18n)
        }

        if (STAGE === 'server' && ENV === 'prod') {
            // 生成PWA使用的 service-worker.js
            await afterServerProd(data)
        }

        log('callback', 'build', `callback: ` + chalk.green('after'))
        if (typeof afterBuild === 'function') await afterBuild(data)

        // 标记完成
        log('success', 'build', __('build.build_complete', {
            type: chalk.cyanBright(appType),
            stage: chalk.green(STAGE),
            env: chalk.green(ENV),
        }))

        console.log(`  > ${Date.now() - timestampStart}ms | ${(new Date()).toLocaleString()}`)

        return
    }

    // ========================================================================
    //
    // 创建对应当前环境的 Webpack 配置
    //
    // ========================================================================

    const data = await createWebpackConfig(Object.assign(kootConfig, {
        afterBuild: after
    }))
    const {
        webpackConfig,
        pwa,
        i18n,
        devServer,
        pathnameChunkmap,
    } = data

    if (STAGE === 'client' && TYPE === 'spa') {
        log('error', 'build',
            `i18n temporarily ` + chalk.redBright(`disabled`) + ` for `
            + chalk.cyanBright('SPA')
        )
    } else if (typeof i18n === 'object') {
        if (STAGE === 'client') {
            log('success', 'build',
                `i18n ` + chalk.yellowBright(`enabled`)
            )
            console.log(`  > type: ${chalk.yellowBright(i18n.type)}`)
            console.log(`  > locales: ${i18n.locales.map(arr => arr[0]).join(', ')}`)
        }
        if (ENV === 'dev' && i18n.type === 'default') {
            console.log(`  > We recommend using ${chalk.greenBright('redux')} mode in DEV enviroment.`)
        }
    }

    // ========================================================================
    //
    // 准备开始打包
    //
    // ========================================================================

    await before()

    const spinnerBuilding = spinner(chalk.yellowBright('[koot/build] ') + __('build.building'))
    const buildingComplete = () => {
        spinnerBuilding.stop()
        console.log(' ')
    }

    /**
     * 处理服务端配置文件
     * [n个应用] 公用1个服务端打包配置，并且merge了client的相关配置
     * 注：如果客户端的配置有特殊要求或者冲突，则需要手动调整下面的代码
     */
    const handlerServerConfig = async () => {

        // 服务端需要全部子项目的配置集合
        // 先合并全部子项目的配置内容
        // 再合并到服务端配置里

        // const appsConfig = await require('../../config/apps')
        let tempClientConfig = new WebpackConfig()
        const defaultServerEntry = [
            'babel-core/register',
            'babel-polyfill',
            path.resolve(
                // __dirname, '../start'
                __dirname,
                '../../',
                appType,
                './server'
            )
        ]
        if (ENV === 'dev') defaultServerEntry.push('webpack/hot/poll?1000')

        // for (let appName in appsConfig) {

        // 如果没有webpack配置，则表示没有react，不需要打包
        // if (!appsConfig[appName].webpack) continue

        let configs = config

        if (!Array.isArray(configs))
            configs = [configs]

        configs.forEach((config) => {
            parseConfig(config)
            tempClientConfig.merge(config)
        })
        // }

        let opt = { RUN_PATH, CLIENT_DEV_PORT }
        const baseConfig = await createBaseConfig()
        const defaultConfig = await createDefaultConfig(opt)
        let thisConfig = new WebpackConfig()

        // 注:在某些项目里，可能会出现下面的加载顺序有特定的区别，需要自行加判断
        //    利用每个app的配置，设置 include\exclude 等。

        thisConfig
            .merge(baseConfig)
            .merge(defaultConfig)
            .merge({
                module: tempClientConfig.module,
                resolve: tempClientConfig.resolve,
                // plugins: tempClientConfig.plugins,
                plugins: tempClientConfig.plugins,
            })

        // 如果用户自己配置了服务端打包路径，则覆盖默认的
        if (dist)
            thisConfig.output.path = path.resolve(dist, './server')
        if (!thisConfig.output.publicPath)
            thisConfig.output.publicPath = defaultPublicPath
        if (tempClientConfig.output && tempClientConfig.output.publicPath)
            thisConfig.output.publicPath = tempClientConfig.output.publicPath
        // if (SYSTEM_CONFIG.WEBPACK_SERVER_OUTPATH)
        //     config.output.path = path.resolve(RUN_PATH, SYSTEM_CONFIG.WEBPACK_SERVER_OUTPATH)

        thisConfig.plugins.unshift(
            new KootI18nPlugin({
                stage: STAGE,
                functionName: i18n ? i18n.expr : undefined,
            })
        )

        if (ENV === 'dev') {
            if (i18n && Array.isArray(i18n.locales) && i18n.locales.length > 0)
                thisConfig.plugins.push(new CopyWebpackPlugin(
                    i18n.locales.map(arr => ({
                        from: arr[2],
                        to: '../.locales/'
                    }))
                ))
        }

        thisConfig.entry = defaultServerEntry

        // webpackConfigs.push(thisConfig)
        webpackConfigs = thisConfig
    }

    const pathConfigLogs = path.resolve(RUN_PATH, `./logs/webpack-config`)
    await fs.ensureDir(pathConfigLogs)
    await fs.writeFile(
        path.resolve(pathConfigLogs,
            `${TYPE}.${STAGE}.${ENV}.${(new Date()).toISOString().replace(/:/g, '_')}.json`
        ),
        JSON.stringify(webpackConfig, null, '\t'),
        'utf-8'
    )

    // 客户端开发模式
    if (STAGE === 'client' && ENV === 'dev') {
        const compiler = webpack(webpackConfig)
        const devServerConfig = Object.assign({
            quiet: false,
            stats: { colors: true },
            hot: true,
            inline: true,
            contentBase: './',
            publicPath: '/dist/',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            open: TYPE === 'spa',
        }, devServer)

        buildingComplete()

        // more config
        // http://webpack.github.io/docs/webpack-dev-server.html
        const server = new WebpackDevServer(compiler, devServerConfig)
        server.listen(
            TYPE === 'spa' ? process.env.SERVER_PORT : CLIENT_DEV_PORT
        )
    }

    // 客户端打包
    if (STAGE === 'client' && ENV === 'prod') {
        await fs.ensureFile(pathnameChunkmap)
        await fs.writeJson(
            pathnameChunkmap,
            {},
            {
                spaces: 4
            }
        )
        // process.env.NODE_ENV = 'production'

        // 执行打包
        const build = async (config) => {
            const compiler = webpack(config)
            await new Promise((resolve, reject) => {
                compiler.run(async (err, stats) => {
                    if (err)
                        return reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)

                    buildingComplete()
                    console.log(stats.toString({
                        chunks: false, // 输出精简内容
                        colors: true
                    }))

                    resolve()
                })
            })
        }

        if (Array.isArray(webpackConfig)) {
            for (let config of webpackConfig)
                await build(config)
        } else {
            await build(webpackConfig)
        }

        await after()
        return
    }

    // 服务端开发环境
    if (STAGE === 'server' && ENV === 'dev') {
        await webpack(
            webpackConfig,
            async (err, stats) => {
                if (err)
                    throw new Error(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)

                buildingComplete()
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
    if (STAGE === 'server' && ENV === 'prod') {
        // process.env.NODE_ENV = 'production'
        // process.env.WEBPACK_SERVER_PUBLIC_PATH =
        //     (typeof webpackConfigs.output === 'object' && webpackConfigs.output.publicPath)
        //         ? webpackConfigs.output.publicPath
        //         : ''

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

        await new Promise((resolve, reject) => {
            webpack(webpackConfig, async (err, stats) => {
                if (err) return reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)

                buildingComplete()
                console.log(stats.toString({
                    chunks: false, // Makes the build much quieter
                    colors: true
                }))

                resolve()
            })
        })

        await after()

        return
    }

}
