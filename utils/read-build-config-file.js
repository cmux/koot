const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const __ = require('./translate')

module.exports = () => new Promise((resolve, reject) => {
    // 读取构建配置
    const pathnameBuildConfig = path.resolve(process.cwd(), './super.build.js')
    if (!fs.existsSync(pathnameBuildConfig)) {
        console.log(
            chalk.red('× ')
            + __('file_not_found', {
                file: chalk.yellowBright('./super.build.js'),
            })
        )
        return reject(new Error('FILE NOT FOUND'))
    }

    const buildConfig = require(pathnameBuildConfig)
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