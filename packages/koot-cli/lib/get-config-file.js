const fs = require('fs-extra')
const path = require('path')

/**
 * 获取配置文件的路径名
 * @async
 * @param {String} cwd
 * @returns {String}
 */
module.exports = async (cwd = process.cwd()) => {
    let test = path.resolve(cwd, 'koot.config.js')

    if (fs.existsSync(test))
        return test

    test = path.resolve(cwd, 'koot.build.js')
    if (fs.existsSync(test))
        return test

    return ''
}
