process.env.DO_WEBPACK = true

//
const fs = require('fs-extra')
const path = require('path')
const opn = require('opn')

//
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const WebpackConfig = require('webpack-config').default
const common = require('./common')
const getAppType = require('../../utils/get-app-type')

// 调试webpack模式
const DEBUG = 1

// 程序启动路径，作为查找文件的基础
const RUN_PATH = process.cwd();

// 初始化环境变量
require('../../utils/init-node-env')()

const {
    WEBPACK_DEV_SERVER_PORT: CLIENT_DEV_PORT,
    WEBPACK_BUILD_ENV: ENV,
    WEBPACK_STAGE_MODE: STAGE,
    WEBPACK_ANALYZE,
    SERVER_DOMAIN,
    SERVER_PORT,
} = process.env

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
    const isAnalyze = (WEBPACK_ANALYZE == 'true' || config.analyze) ? true : false
    if (isAnalyze)
        config.plugins.push(
            new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()
        )

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

    // 根据当前环境变量，定位对应的默认配置文件
    _path = _path || path.resolve(__dirname, `./${STAGE}/${ENV}.js`)

    const factory = await getConfigFactory(_path)
    const config = await factory(opt)

    return config
}

/**
 * 根据应用配置生产出一个默认webpack配置[客户端情况的SPA模式使用]
 * 
 * @param {any} opt 
 * @returns 
 */
async function createSPADefaultConfig(opt, aliases) {
    return createDefaultConfig(opt, path.resolve(__dirname, `./${STAGE}/${ENV}.spa.js`), aliases)
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
    if (ENV === 'dev')
        fs.ensureFileSync(path.resolve(
            process.cwd(),
            global.__SUPER_DIST__,
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
module.exports = async (args = {}) => {
    let {
        config,
        dist,
        aliases,
        beforeBuild,
        afterBuild,
    } = args
    DEBUG && console.log('============== Webpack Debug =============')
    DEBUG && console.log('Webpack 打包环境：', STAGE, ENV)

    // 将打包目录存入全局变量
    // 在打包时，会使用 DefinePlugin 插件将该值赋值到 __DIST__ 全部变量中，以供项目内代码使用
    global.__SUPER_DIST__ = dist

    await _beforeBuild(args)
    if (typeof beforeBuild === 'function') {
        await beforeBuild(args)
    }

    if (typeof config === 'function') config = await config()
    if (typeof config !== 'object') config = {}

    // webpack 执行用的配置对象
    let webpackConfigs = []

    // 默认rules
    const baseConfig = await common.factory({
        aliases,
        env: ENV,
        stage: STAGE,
        spa: false,
    })

    /**
     * 处理 Webpack 配置对象
     * 
     * @param {object} custom 合并 Webpack 配置对象
     * @returns 合并后的值
     */
    const parseConfig = (config = {}) => {
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
            config.plugins = [
                ...baseConfig.plugins,
            ]
        } else {
            if (config.plugins[0] === true) {
                config.plugins.shift()
            } else {
                config.plugins = [
                    ...baseConfig.plugins,
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

        let opt = {
            RUN_PATH,
            CLIENT_DEV_PORT,
            /*APP_KEY: appName */
        }
        let defaultConfig = await createDefaultConfig(opt)
        let defaultSPAConfig = await createSPADefaultConfig(opt)

        // let appConfig = appsConfig[appName]

        // 如果没有webpack配置，则表示没有react，不需要打包
        // if (!appConfig.webpack) continue

        let clientConfigs = config

        // 统一转成数组，支持多个client配置
        if (!Array.isArray(clientConfigs)) {
            clientConfigs = [clientConfigs]
        }

        clientConfigs.forEach((clientConfig) => {

            let config = new WebpackConfig()
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
                if (clientConfig.spa) {
                    config = Object.assign({}, defaultSPAConfig)
                }
                return config
            })()

            // 如果自定义了，则清除默认
            if (clientConfig.entry) _defaultConfig.entry = undefined
            if (clientConfig.output) _defaultConfig.output = undefined

            parseConfig(clientConfig)

            config
                .merge(_defaultConfig)
                .merge(clientConfig)

            if ((
                typeof config.entry === 'object' &&
                !config.entry.client
            ) || typeof config.entry !== 'string'
            ) {
                config.entry.client = path.resolve(
                    // RUN_PATH,
                    // `./system/super3/client`
                    __dirname,
                    '../../',
                    getAppType(),
                    './client'
                )
            }

            webpackConfigs.push(config)
        })
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
        let defaultConfig = await createDefaultConfig(opt)
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
        if (dist) {
            thisConfig.output.path = path.resolve(dist, './server')
        }
        // if (SYSTEM_CONFIG.WEBPACK_SERVER_OUTPATH)
        //     config.output.path = path.resolve(RUN_PATH, SYSTEM_CONFIG.WEBPACK_SERVER_OUTPATH)

        webpackConfigs.push(thisConfig)
    }

    const after = async (app) => {
        const theArgs = {
            app,
            ...args
        }

        if (STAGE === 'server' && ENV === 'dev') {
            if (!global.__SUPER_DEV_SERVER_OPN__) {
                opn(`http://${SERVER_DOMAIN}:${SERVER_PORT}/`)
                global.__SUPER_DEV_SERVER_OPN__ = true
            }
        }

        await _afterBuild(theArgs)
        if (typeof afterBuild === 'function')
            await afterBuild(theArgs)
    }

    // 客户端开发模式
    if (STAGE === 'client' && ENV === 'dev') {

        await handlerClientConfig()

        const compiler = webpack(makeItButter(webpackConfigs))

        // more config
        // http://webpack.github.io/docs/webpack-dev-server.html
        const server = new WebpackDevServer(compiler, {
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
        })
        server.listen(CLIENT_DEV_PORT)
    }

    // 客户端打包
    if (STAGE === 'client' && ENV === 'dist') {

        // process.env.NODE_ENV = 'production'

        await handlerClientConfig()

        // 执行打包
        const compiler = webpack(makeItButter(webpackConfigs))

        await compiler.run(async (err, stats) => {
            if (err) console.log(`webpack dist error: ${err}`)

            console.log(stats.toString({
                chunks: false, // 输出精简内容
                colors: true
            }))

            await after()
        })

    }

    // 服务端开发环境
    if (STAGE === 'server' && ENV === 'dev') {

        await handlerServerConfig()

        await webpack(
            makeItButter(webpackConfigs),
            async (err, stats) => {
                if (err) console.log(`webpack dev error: ${err}`)

                console.log(stats.toString({
                    chunks: false,
                    colors: true
                }))

                await after()
            }
        )
    }

    // 服务端打包
    if (STAGE === 'server' && ENV === 'dist') {

        // process.env.NODE_ENV = 'production'

        await handlerServerConfig()

        await webpack(makeItButter(webpackConfigs), async (err, stats) => {
            if (err) console.log(`webpack dist error: ${err}`)

            console.log(stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            }))

            await after()
        })
    }

    // DEBUG && console.log('执行配置：')
    // DEBUG && console.log('-----------------------------------------')
    // DEBUG && console.log(JSON.stringify(webpackConfigs))
    if (DEBUG) {
        await fs.ensureDir(
            path.resolve(
                RUN_PATH,
                `./logs/webpack-config`
            )
        )
        await fs.writeFile(
            path.resolve(
                RUN_PATH,
                `./logs/webpack-config/${STAGE}.${ENV}.${Date.now()}.json`
            ),
            JSON.stringify(webpackConfigs, null, '\t'),
            'utf-8'
        )
    }
    DEBUG && console.log('============== Webpack Debug End =============')

}

// justDoooooooooooooIt()
