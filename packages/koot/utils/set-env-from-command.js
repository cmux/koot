const path = require('path')
const chalk = require('chalk')

/**
 * 从命令确定环境变量
 * @param {Object} Settings 
 */
module.exports = ({
    config,
    type,
    port
}, quiet = false) => {
    let modified = false
    const log = (key, value) => {
        if (quiet) return
        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[koot] ')
            + `set env ` + chalk.green(key)
            + `\n      -> `
            + value
        )
    }

    if (typeof config === 'string') {
        config = path.resolve(config)
        process.env.KOOT_BUILD_CONFIG_PATHNAME = config
        log('KOOT_BUILD_CONFIG_PATHNAME', config)
        modified = true
    }

    if (typeof type === 'string') {
        process.env.KOOT_PROJECT_TYPE = type
        log('KOOT_PROJECT_TYPE', type)
        modified = true
    }

    if (typeof port === 'string' || typeof port === 'number') {
        process.env.SERVER_PORT = port
        log('SERVER_PORT', port)
        modified = true
    }

    if (modified) console.log(' ')

    return {
        config, type, port
    }
}
