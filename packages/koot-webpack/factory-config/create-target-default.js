const fs = require('fs-extra')
const path = require('path')

/**
 * 根据当前环境生产默认配置对象
 * @async
 * @param {Object} [options={}] 生产配置时使用的选项
 * @param {String} [configFilePathname] 指定配置文件路径
 * @returns {Object} 根据当前环境的配置对象
 */
module.exports = async (options = {}, configFilePathname) => {
    const {
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        WEBPACK_BUILD_TYPE: TYPE,
    } = process.env

    // 根据当前环境变量，定位对应的默认配置文件
    configFilePathname = configFilePathname || path.resolve(__dirname, `_defaults/${TYPE}.${STAGE}.${ENV}.js`)

    if (!fs.existsSync(configFilePathname))
        throw new Error(`生产默认配置对象：未到对应的配置文件\n  > ${configFilePathname}`)

    const factory = require(configFilePathname)
    return await factory(options)
}
