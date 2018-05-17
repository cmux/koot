const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const __ = require('./translate')

module.exports = (
    pathname = typeof process.env.WEBPACK_BUILD_CONFIG_PATHNAME === 'undefined'
        ? path.resolve(process.cwd(), './super.build.js')
        : process.env.WEBPACK_BUILD_CONFIG_PATHNAME
) => new Promise((resolve, reject) => {
    // 读取构建配置
    if (!fs.existsSync(pathname)) {
        console.log(
            chalk.red('× ')
            + __('file_not_found', {
                file: chalk.yellowBright('./super.build.js'),
            })
        )
        return reject(new Error('FILE NOT FOUND'))
    }

    const buildConfig = require(pathname)
    if (typeof buildConfig !== 'object') {
        console.log(
            chalk.red('× ')
            + __('build.config_type_error', {
                file: chalk.yellowBright('./super.build.js'),
                type: chalk.green('Object')
            })
        )
        return reject(new Error('TYPE NOT OBJECT'))
    }

    resolve(buildConfig)
})
