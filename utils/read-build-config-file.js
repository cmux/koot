const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const __ = require('./translate')
const defaults = require('../defaults/build-config')

/**
 * 读取打包配置文件的内容
 * @param {String} [pathname] 打包配置文件路径
 * @returns {Object} 配置对象
 */
module.exports = (
    pathname = typeof process.env.WEBPACK_BUILD_CONFIG_PATHNAME === 'undefined'
        ? path.resolve(process.cwd(), './koot.build.js')
        : process.env.WEBPACK_BUILD_CONFIG_PATHNAME
) => new Promise((resolve, reject) => {
    // 读取构建配置
    if (!fs.existsSync(pathname)) {
        console.log(
            chalk.redBright('× ')
            + __('file_not_found', {
                file: chalk.yellowBright('./koot.build.js'),
            })
        )
        return reject(new Error('FILE NOT FOUND'))
    }

    const buildConfig = Object.assign({}, defaults, require(pathname))
    if (typeof buildConfig !== 'object') {
        console.log(
            chalk.redBright('× ')
            + __('build.config_type_error', {
                file: chalk.yellowBright('./koot.build.js'),
                type: chalk.green('Object')
            })
        )
        return reject(new Error('TYPE NOT OBJECT'))
    }

    resolve(buildConfig)
})
