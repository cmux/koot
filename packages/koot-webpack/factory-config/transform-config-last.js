const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const {
    keyConfigBuildDll, filenameDll, filenameDllManifest,
    keyConfigOutputPathShouldBe
} = require('koot/defaults/before-build')
const getDirDevDll = require('koot/libs/get-dir-dev-dll')

/**
 * Webpack 配置处理 - 最终处理
 * @async
 * @param {Object|Array} config webpack 配置对象
 * @param {Object} kootBuildConfig
 * @return {Object|Array}
 */
const transform = async (config, kootBuildConfig = {}) => {
    const {
        [keyConfigBuildDll]: createDll = false,
        // dist,
        devDll: webpackDll = [],
    } = kootBuildConfig
    // const {
    //     WEBPACK_BUILD_STAGE: STAGE,
    // } = process.env

    // 生成 DLL 包模式: 本次打包仅生成 DLL 包
    if (createDll) {
        const defaults = [
            'react',
            'react-dom',
            'redux',
            'redux-thunk',
            'react-redux',
            'react-router',
            'react-router-redux',
            // 'koot',
        ]
        const result = Array.isArray(config) ? { ...config[0] } : { ...config }
        delete result.watch
        delete result.watchOptions

        // 如果自行添加了 koot，排除
        const library = (!Array.isArray(webpackDll) || !webpackDll.length) ? defaults : webpackDll
        if (library.includes('koot'))
            library.splice(library.indexOf('koot'), 1)
        result.entry = {
            library
        }

        // console.log('result.entry.library', result.entry.library)
        result.output = {
            filename: filenameDll,
            library: "[name]_[hash]",
            // path: STAGE === 'server' ? path.resolve(dist, 'server') : dist
            path: getDirDevDll()
        }
        process.env.KOOT_DEV_DLL_FILE_CLIENT = path.resolve(getDirDevDll(undefined, 'client'), filenameDll)
        process.env.KOOT_DEV_DLL_FILE_SERVER = path.resolve(getDirDevDll(undefined, 'server'), filenameDll)
        result.plugins.push(
            new webpack.DllPlugin({
                // context: path.resolve(__dirname, '../../../../'),
                path: path.resolve(result.output.path, filenameDllManifest),
                name: "[name]_[hash]"
            })
        )
        return validate(result, kootBuildConfig)
    }

    // 数组情况，拆分每项分别处理
    if (Array.isArray(config)) {
        const r = []
        for (const thisConfig of config) {
            r.push(await transform(thisConfig, kootBuildConfig))
        }
        return r
    }

    // copy this

    return validate(
        Object.assign({}, config),
        kootBuildConfig
    )
}

/**
 * 生效处理
 * @param {Object} config 
 * @returns {Object}
 */
const validate = (config, kootBuildConfig) => {
    // try to fix a pm2 bug that will currupt [name] value
    if (typeof config.output === 'object') {
        for (let key in config.output) {
            if (typeof config.output[key] === 'string')
                config.output[key] = config.output[key].replace(/-_-_-_-_-_-(.+?)-_-_-_-_-_-/g, '[name]')
        }
    }

    // console.log('')
    // console.log('kootBuildConfig', kootBuildConfig)
    validatePlugins(config, kootBuildConfig)
    validateModuleRules(config, kootBuildConfig)

    // analyze
    // const isAnalyze = (JSON.parse(process.env.WEBPACK_ANALYZE) || config.analyze) ? true : false
    // if (isAnalyze) {
    //     config.output.filename = 'entry.[id].[name].js'
    //     config.output.chunkFilename = 'chunk.[id].[name].js'
    //     // config.plugins.push(
    //     //     new (webpackBundleAnalyzer.BundleAnalyzerPlugin)()
    //     // )
    // }

    // custom logic use
    delete config.__ext
    delete config.spa
    delete config.analyzer
    delete config.htmlPath
    delete config[keyConfigOutputPathShouldBe]

    return config
}

/**
 * 生效处理: plugins
 * @param {Object} config 
 * @returns {Object}
 */
const validatePlugins = (config, kootBuildConfig = {}) => {
    const {
        WEBPACK_BUILD_ENV: ENV,
        // WEBPACK_BUILD_STAGE: STAGE,
    } = process.env

    // 如果没有 plugins 项，创建空 Array
    if (!Array.isArray(config.plugins)) config.plugins = []

    if (ENV === 'dev' && !kootBuildConfig[keyConfigBuildDll]) {
        // 如果查有 DLL 结果文件，添加 DllReferencePlugin
        // const file = STAGE === 'server'
        //     ? path.resolve(kootBuildConfig.dist, 'server', filenameDllManifest)
        //     : path.resolve(kootBuildConfig.dist, filenameDllManifest)
        const file = path.resolve(getDirDevDll(), filenameDllManifest)
        if (fs.existsSync(file)) {
            config.plugins.push(
                new webpack.DllReferencePlugin({
                    // context: path.resolve(__dirname, '../../../../'),
                    // scope: match[1],
                    manifest: file
                })
            )
        }
        // const dir = path.resolve(kootBuildConfig.dist, dirDll, STAGE)
        // if (fs.existsSync(dir)) {
        //     const regex = new RegExp(filenameDllManifest.replace('[name]', '^(.+)') + '$')
        //     fs.readdirSync(dir)
        //         .filter(filename => regex.test(filename))
        //         .forEach(filename => {
        //             const match = regex.exec(filename)
        //             config.plugins.push(
        //                 new webpack.DllReferencePlugin({
        //                     context: path.resolve(__dirname, '../../../../'),
        //                     // scope: match[1],
        //                     manifest: path.resolve(dir, filename)
        //                 })
        //             )
        //         })
        // }
    }

    // 清除 plugins 中的空项和非法项
    config.plugins = config.plugins
        .filter(plugin => (
            typeof plugin !== 'undefined' &&
            plugin !== null
        ))
}

const validateModuleRules = (config) => {
    // 删除重复 loader
    if (Array.isArray(config.module.rules)) {
        config.module.rules = removeDuplicateObject(config.module.rules)
    }

    // 删除重复对象
    function removeDuplicateObject(list) {
        // let map = {}
        // list = (() => {
        //     return list.map((rule) => {
        //         let key = JSON.stringify(rule)
        //         key = key.toLowerCase().replace(/ /g, '')
        //         if (map[key])
        //             rule = undefined
        //         else
        //             map[key] = 1
        //         return rule
        //     })
        // })()
        return list.filter(rule => !!rule)
    }
}

module.exports = transform
