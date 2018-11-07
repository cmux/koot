// const webpackBundleAnalyzer = require('webpack-bundle-analyzer')

/**
 * Webpack 配置处理 - 最终处理
 * @async
 * @param {Object|Array} config 
 * @return {Object|Array}
 */
const transform = async (config) => {

    // 数组情况，拆分每项分别处理
    if (Array.isArray(config))
        return config.map(thisConfig => transform(thisConfig))

    // copy this
    config = Object.assign({}, config)

    // try to fix a pm2 bug that will currupt [name] value
    if (typeof config.output === 'object') {
        for (let key in config.output) {
            if (typeof config.output[key] === 'string')
                config.output[key] = config.output[key].replace(/-_-_-_-_-_-(.+?)-_-_-_-_-_-/g, '[name]')
        }
    }

    // remove all undefined from plugins
    if (!Array.isArray(config.plugins)) config.plugins = []
    config.plugins = config.plugins
        .filter(plugin => (
            typeof plugin !== 'undefined' &&
            plugin !== null
        ))

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
        // config.plugins.push(
        //     new (webpackBundleAnalyzer.BundleAnalyzerPlugin)()
        // )
    }

    // custom logic use
    delete config.__ext
    delete config.spa
    delete config.analyzer
    delete config.htmlPath

    // no ref obj
    return config
}

module.exports = transform
