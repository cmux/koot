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
}) => {
    let modified = false

    if (typeof config === 'string') {
        config = path.resolve(config)
        process.env.KOOT_BUILD_CONFIG_PATHNAME = config
        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[koot] ')
            + `set env ` + chalk.green('KOOT_BUILD_CONFIG_PATHNAME')
            + `\n             -> `
            + config
        )
        modified = true
    }

    if (typeof type === 'string') {
        process.env.KOOT_PROJECT_TYPE = type
        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[koot] ')
            + `set env ` + chalk.green('KOOT_PROJECT_TYPE')
            + `\n             -> `
            + type
        )
        modified = true
    }

    if (typeof port === 'string' || typeof port === 'number') {
        process.env.SERVER_PORT = type
        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[koot] ')
            + `set env ` + chalk.green('SERVER_PORT')
            + `\n             -> `
            + port
        )
        modified = true
    }

    if (modified) console.log(' ')

    return {
        config, type, port
    }
}
