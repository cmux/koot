const path = require('path')
const chalk = require('chalk')

module.exports = ({
    config,
    type,
}) => {
    let modified = false

    if (typeof config === 'string') {
        config = path.resolve(config)
        process.env.WEBPACK_BUILD_CONFIG_PATHNAME = config
        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[super/build] ')
            + `set env ` + chalk.green('WEBPACK_BUILD_CONFIG_PATHNAME')
            + `\n             -> `
            + config
        )
        modified = true
    }

    if (typeof type === 'string') {
        process.env.SUPER_PROJECT_TYPE = type
        console.log(
            chalk.green('√ ')
            + chalk.yellowBright('[super/build] ')
            + `set env ` + chalk.green('SUPER_PROJECT_TYPE')
            + `\n             -> `
            + type
        )
        modified = true
    }

    if (modified) console.log(' ')

    return {
        config, type
    }
}
