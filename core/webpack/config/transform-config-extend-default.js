const createGlobalDefaultConfig = require('./create-global-default')

module.exports = async (config = {}, data = {}) => {
    const {
        aliases, defines,
    } = data
    const configGlobalDefault = await createGlobalDefaultConfig({
        aliases, defines,
    })

    // 合并 module.rules / loaders
    if (typeof config.module === 'object') {
        if (!Array.isArray(config.module.rules)) {
            config.module.rules = configGlobalDefault.module.rules
        } else {
            if (config.module.rules[0] === true) {
                config.module.rules.shift()
            } else {
                config.module.rules = [
                    ...configGlobalDefault.module.rules,
                    ...config.module.rules
                ]
            }
        }
    } else {
        // config.module = configGlobalDefault.module.rules
        config.module = configGlobalDefault.module
    }

    // 合并 plugins
    if (!Array.isArray(config.plugins)) {
        config.plugins = configGlobalDefault.plugins
    } else {
        if (config.plugins[0] === true) {
            config.plugins.shift()
        } else {
            config.plugins = [
                ...configGlobalDefault.plugins,
                ...config.plugins
            ]
        }
    }

    // 合并 resolve
    config.resolve = Object.assign({}, configGlobalDefault.resolve, config.resolve || {})
    // for (let key of Object.keys(configGlobalDefault.resolve)) {

    // }

    return config
}
