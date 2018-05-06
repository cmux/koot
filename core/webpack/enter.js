process.env.DO_WEBPACK = true

//
const fs = require('fs-extra')
const path = require('path')
const opn = require('opn')
const chalk = require('chalk')

//
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const WebpackConfig = require('webpack-config').default
const common = require('./common')
const getAppType = require('../../utils/get-app-type')
const createPWAsw = require('../pwa/create')
const SuperI18nPlugin = require("./plugins/i18n")


// 调试webpack模式
const DEBUG = 1

// 程序启动路径，作为查找文件的基础
const RUN_PATH = process.cwd();

// 初始化环境变量
require('../../utils/init-node-env')()

// 用户自定义系统配置
// const SYSTEM_CONFIG = require('../../config/system')
// const DIST_PATH = require('')

process.env.DO_WEBPACK = false

/**
 * 修复配置
 * 配置有可能是 Array
 * 
 * @param {any} config webpack的配置对象
 * @returns 修复后的配置对象
 */
function makeItButter(config) {
    // 数组情况，拆分每项分别处理
    if (Array.isArray(config))
        return config.map(thisConfig => makeItButter(thisConfig))

    // no ref obj
    config = Object.assign({}, config)

    // try to fix a pm2 bug that will currupt [name] value
    if (config.output) {
        for (let key in config.output) {
            if (typeof config.output[key] === 'string')
                config.output[key] = config.output[key].replace(/-_-_-_-_-_-(.+?)-_-_-_-_-_-/g, '[name]')
        }
    }

    // remove all undefined from plugins
    if (!Array.isArray(config.plugins)) {
        config.plugins = []
    }
    config.plugins = config.plugins.filter(plugin => typeof plugin !== 'undefined')

    // remove duplicate plugins
    // if (Array.isArray(config.plugins)) {
    //     config.plugins = removeDuplicateObject(config.plugins)
    // }

    // remove duplicate rules

    if (Array.isArray(config.module.rules)) {
        config.module.rules = removeDuplicateObject(config.module.rules)
    }

    // 删除重复对象
    function removeDuplicateObject(list) {
        let map = {}
        list = (() => {
            return list.map((rule) => {
                let key = JSON.stringify(rule)
                key = key.toLowerCase().replace(/ /g, '')
                if (map[key])
                    rule = undefined
                else
                    map[key] = 1
                return rule
            })
        })()
        return list.filter(rule => rule != undefined)
    }

    // analyze
    const isAnalyze = (JSON.parse(process.env.WEBPACK_ANALYZE) || config.analyze) ? true : false
    if (isAnalyze) {
        config.output.filename = 'entry.[id].[name].js'
        config.output.chunkFilename = 'chunk.[id].[name].js'
        config.plugins.push(
            new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()
        )
    }

    // custom logic use
    delete config.__ext
    delete config.spa
    delete config.analyzer
    delete config.htmlPath

    // no ref obj
    return config
}

/**
 * 根据应用配置生产出一个默认webpack配置
 * 
 * @param {any} opt 应用配置
 * @param {any} _path 读取默认配置文件地址，非必须
 * @returns 
 */
async function createDefaultConfig(opt, _path) {
    const {
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        WEBPACK_BUILD_TYPE: TYPE,
    } = process.env

    // 根据当前环境变量，定位对应的默认配置文件
    _path = _path || path.resolve(__dirname, `./defaults/${TYPE}.${STAGE}.${ENV}.js`)

    const factory = await getConfigFactory(_path)
    const config = await factory(opt)

    return config
}

/**
 * 获取配置生成的工厂方法
 * 
 * @param {any} path 工厂方法对应的文件路径
 * @returns 工厂方法
 */
async function getConfigFactory(path) {

    let factory

    if (fs.existsSync(path))
        factory = await require(path)
    else
        console.log(`!!! ERROR !!!  没找到对应的配置文件: ${path}`)

    return factory
}



const _beforeBuild = async () => {
    const {
        WEBPACK_BUILD_ENV: ENV,
    } = process.env

    if (ENV === 'dev')
        fs.ensureFileSync(path.resolve(
            process.cwd(),
            process.env.SUPER_DIST_DIR,
            `./server/index.js`
        ))
}
const _afterBuild = async () => {
    // console.log(app)
    // console.log('AFTER')
}

/**
 * Webpack 运行入口方法
 */
module.exports = async ({
    config,
    dist,
    aliases,
    i18n = false,
    pwa,
    devServer = {},
    beforeBuild = () => { },
    afterBuild = () => { },
}) => {
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        // WEBPACK_ANALYZE,
        WEBPACK_DEV_SERVER_PORT: CLIENT_DEV_PORT,
        SERVER_DOMAIN,
        SERVER_PORT,
    } = process.env

    DEBUG && console.log('============== Webpack Debug =============')
    DEBUG && console.log('Webpack 打包环境：', TYPE, STAGE, ENV)

    // webpack 执行用的配置对象
    let webpackConfigs = []

    // 创建默认rules
    const createBaseConfig = async () =>
        await common.factory({
            aliases,
            env: ENV,
            stage: STAGE,
            spa: false,
        })

    // 将打包目录存入环境变量
    // 在打包时，会使用 DefinePlugin 插件将该值赋值到 __DIST__ 全部变量中，以供项目内代码使用
    process.env.SUPER_DIST_DIR = dist

    // chunkmap 文件地址
    const pathnameChunkmap = path.resolve(dist, `.public-chunkmap.json`)

    // 处理i18n
    if (typeof i18n === 'object') {
        let type = ENV === 'dev' ? 'redux' : 'default'
        let expr = '__'
        let locales

        if (Array.isArray(i18n)) {
            locales = [...i18n]
        } else {
            type = i18n.type || type
            expr = i18n.expr || expr
            locales = [...i18n.locales || []]
        }

        if (type === 'store') type = 'redux'
        type = type.toLowerCase()

        if (STAGE === 'client') {
            console.log(chalk.green('√') + ` i18n enabled`)
            console.log(`  > type: ${chalk.yellowBright(type)}`)
            console.log(`  > locales: ${locales.map(arr => arr[0]).join(', ')}`)
        }

        locales.forEach(arr => {
            arr[1] = fs.readJsonSync(path.resolve(process.cwd(), arr[1]))
        })

        process.env.SUPER_I18N = JSON.stringify(true)
        process.env.SUPER_I18N_TYPE = JSON.stringify(type)
        process.env.SUPER_I18N_LOCALES = JSON.stringify(locales)

        i18n = {
            type,
            expr,
            locales,
        }

        if (ENV === 'dev' && type === 'default') {
            console.log(`  > We recommend using ${chalk.greenBright('redux')} mode in DEV enviroment.`)
        }
    } else {
        i18n = false
        process.env.SUPER_I18N = JSON.stringify(false)
    }

    const args = {
        config,
        dist,
        aliases,
        i18n,
        pwa,
        devServer,
    }

    await _beforeBuild(args)
    if (typeof beforeBuild === 'function') {
        await beforeBuild(args)
    }

    if (typeof config === 'function') config = await config()
    if (typeof config !== 'object') config = {}

    /**
     * 处理 Webpack 配置对象
     * 
     * @param {object} custom 合并 Webpack 配置对象
     * @returns 合并后的值
     */
    const parseConfig = async (config = {}) => {
        const baseConfig = await createBaseConfig()
        // 合并 module.rules / loaders
        if (typeof config.module === 'object') {
            if (!Array.isArray(config.module.rules)) {
                config.module.rules = [
                    ...baseConfig.module.rules,
                ]
            } else {
                if (config.module.rules[0] === true) {
                    config.module.rules.shift()
                } else {
                    config.module.rules = [
                        ...baseConfig.module.rules,
                        ...config.module.rules
                    ]
                }
                baseConfig.module.rules = undefined
            }
        } else {
            config.module = {
                rules: [
                    ...baseConfig.module.rules
                ]
            }
        }

        // 合并 plugins
        if (STAGE === 'server') {
            config.plugins = [
                ...baseConfig.plugins,
            ]
        } else if (!Array.isArray(config.plugins)) {
            // config.plugins = [
            //     ...baseConfig.plugins,
            // ]
        } else {
            if (config.plugins[0] === true) {
                config.plugins.shift()
            } else {
                config.plugins = [
                    // ...baseConfig.plugins,
                    ...config.plugins
                ]
            }
            baseConfig.plugins = undefined
        }

        return config
    }

    /**
     * 处理客户端配置文件
     * [n个应用] x [m个打包配置] = [webpack打包配置集合]
     */
    const handlerClientConfig = async () => {

        // 把装载的所有子应用的 webpack 配置都加上
        // const appsConfig = await require('../../config/apps')

        // for (let appName in appsConfig) {
        const handleSingleConfig = async (localeId, localesObj) => {
            let opt = {
                RUN_PATH,
                CLIENT_DEV_PORT,
                localeId,
                /*APP_KEY: appName */
            }
            const baseConfig = await createBaseConfig()
            const defaultConfig = await createDefaultConfig(opt)
            // let defaultSPAConfig = await createSPADefaultConfig(opt)

            // let appConfig = appsConfig[appName]

            // 如果没有webpack配置，则表示没有react，不需要打包
            // if (!appConfig.webpack) continue

            let clientConfigs = config

            // 统一转成数组，支持多个client配置
            if (!Array.isArray(clientConfigs)) {
                clientConfigs = [clientConfigs]
            }

            for (let clientConfig of clientConfigs) {
                const config = new WebpackConfig()
                clientConfig = new WebpackConfig()
                    .merge(baseConfig)
                    .merge(clientConfig)

                // 跟进打包环境和用户自定义配置，扩展webpack配置
                if (clientConfig.__ext) {
                    clientConfig.merge(clientConfig.__ext[ENV])
                }

                let _defaultConfig = (() => {

                    let config = Object.assign({}, defaultConfig)

                    // 如果是SPA应用
                    // if (clientConfig.spa) {
                    //     config = Object.assign({}, defaultSPAConfig)
                    // }
                    return config
                })()

                // 如果自定义了，则清除默认
                if (clientConfig.entry) _defaultConfig.entry = undefined
                if (clientConfig.output) _defaultConfig.output = undefined

                await parseConfig(clientConfig)

                config
                    .merge(_defaultConfig)
                    .merge(clientConfig)

                if (typeof config.output !== 'object') {
                    config.output = {}
                }
                if (!config.output.path) {
                    config.output.path = path.resolve(dist, `./public`)
                    config.output.publicPath = ''
                }

                const defaultClientEntry = path.resolve(
                    // RUN_PATH,
                    // `./system/super3/client`
                    __dirname,
                    '../../',
                    getAppType(),
                    './client'
                )

                if (
                    typeof config.entry === 'object' &&
                    !config.entry.client
                ) {
                    config.entry.client = defaultClientEntry
                } else if (config.entry === 'object') {

                } else if (typeof config.entry !== 'string') {
                    config.entry = {
                        client: defaultClientEntry
                    }
                }

                if (localeId && typeof localesObj === 'object') {
                    config.plugins.unshift(
                        new SuperI18nPlugin({
                            stage: STAGE,
                            localeId,
                            locales: localesObj,
                            functionName: i18n.expr,
                        })
                    )
                } else if (typeof i18n === 'object') {
                    config.plugins.unshift(
                        new SuperI18nPlugin({
                            stage: STAGE,
                            functionName: i18n.expr,
                        })
                    )
                }

                webpackConfigs.push(config)
            }
        }

        if (typeof i18n === 'object') {
            const {
                type = 'default'
            } = i18n
            switch (type) {
                case 'redux': {
                    await handleSingleConfig()
                    break
                }
                default: {
                    for (let arr of i18n.locales) {
                        await handleSingleConfig(arr[0], arr[1])
                    }
                }
            }
        } else {
            await handleSingleConfig()
        }

        // }
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
        if (tempClientConfig.output && tempClientConfig.output.publicPath)
            thisConfig.output.publicPath = tempClientConfig.output.publicPath
        // if (SYSTEM_CONFIG.WEBPACK_SERVER_OUTPATH)
        //     config.output.path = path.resolve(RUN_PATH, SYSTEM_CONFIG.WEBPACK_SERVER_OUTPATH)

        if (typeof i18n === 'object')
            thisConfig.plugins.unshift(
                new SuperI18nPlugin({
                    stage: STAGE,
                    functionName: i18n.expr,
                })
            )

        webpackConfigs.push(thisConfig)
    }

    const after = async (app) => {
        const theArgs = {
            app,
            ...args
        }

        if (STAGE === 'server' && ENV === 'dev') {
            if (!global.__SUPER_DEV_SERVER_OPN__) {
                opn(`http://${SERVER_DOMAIN || 'localhost'}:${SERVER_PORT}/`)
                global.__SUPER_DEV_SERVER_OPN__ = true
            }
        }

        if (pwa && STAGE === 'client' && ENV === 'prod') {
            // 生成PWA使用的 service-worker.js
            console.log(' ')
            await createPWAsw(pwa, i18n)
            console.log(' ')
        }

        await _afterBuild(theArgs)
        if (typeof afterBuild === 'function')
            await afterBuild(theArgs)

        return
    }

    const logConfigToFile = async () => {
        await fs.ensureDir(
            path.resolve(
                RUN_PATH,
                `./logs/webpack-config`
            )
        )
        await fs.writeFile(
            path.resolve(
                RUN_PATH,
                `./logs/webpack-config/${TYPE}.${STAGE}.${ENV}.${(new Date()).toISOString().replace(/:/g, '_')}.json`
            ),
            JSON.stringify(webpackConfigs, null, '\t'),
            'utf-8'
        )
        // DEBUG && console.log('执行配置：')
        // DEBUG && console.log('-----------------------------------------')
        // DEBUG && console.log(JSON.stringify(webpackConfigs))
        DEBUG && console.log('============== Webpack Debug End =============')
        return
    }

    // 客户端开发模式
    if (STAGE === 'client' && ENV === 'dev') {

        await handlerClientConfig()
        await logConfigToFile()

        const compiler = webpack(makeItButter(webpackConfigs))
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
            after,
        }, devServer)

        // more config
        // http://webpack.github.io/docs/webpack-dev-server.html
        const server = new WebpackDevServer(compiler, devServerConfig)
        server.listen(CLIENT_DEV_PORT)
    }

    // 客户端打包
    if (STAGE === 'client' && ENV === 'prod') {

        await fs.writeJson(
            pathnameChunkmap,
            {},
            {
                spaces: 4
            }
        )
        // process.env.NODE_ENV = 'production'

        await handlerClientConfig()
        await logConfigToFile()

        // 执行打包
        const compiler = webpack(makeItButter(webpackConfigs))

        await new Promise((resolve, reject) => {
            compiler.run(async (err, stats) => {
                if (err) reject(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)

                console.log(stats.toString({
                    chunks: false, // 输出精简内容
                    colors: true
                }))

                resolve()
            })
        })

        await after()
        return
    }

    // 服务端开发环境
    if (STAGE === 'server' && ENV === 'dev') {

        await handlerServerConfig()
        await logConfigToFile()

        await webpack(
            makeItButter(webpackConfigs),
            async (err, stats) => {
                if (err) console.log(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)

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

        if (!fs.pathExistsSync(pathnameChunkmap)) {
            await fs.ensureFile(pathnameChunkmap)
            process.env.WEBPACK_CHUNKMAP = ''
            console.log(chalk.green('√ ') + chalk.greenBright('Chunkmap') + ` file does not exist. Crated an empty one.`)
        } else {
            const content = await fs.readFile(pathnameChunkmap)
            try {
                process.env.WEBPACK_CHUNKMAP = JSON.parse(content)
            } catch (e) {
                process.env.WEBPACK_CHUNKMAP = ''
            }
        }

        await handlerServerConfig()
        await logConfigToFile()

        await webpack(makeItButter(webpackConfigs), async (err, stats) => {
            if (err) console.log(`webpack error: [${TYPE}-${STAGE}-${ENV}] ${err}`)

            console.log(stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            }))

            await after()
        })

        return
    }

}

// justDoooooooooooooIt()
