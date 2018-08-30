const factoryConfig = require('./.factory')

module.exports = (async () => {
    const defaults = await factoryConfig()

    // 针对开发环境的定制配置
    const config = {}

    return Object.assign({}, defaults, config)
})()
