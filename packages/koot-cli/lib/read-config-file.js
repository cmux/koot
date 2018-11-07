const getConfigFile = require('./get-config-file')

/**
 * 读取配置文件对象
 * @async
 * @param {String} cwd
 * @returns {Object}
 */
module.exports = async (cwd = process.cwd()) => {
    const file = await getConfigFile(cwd)
    return require(file)
}
