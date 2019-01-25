/**
 * 从 koot 配置对象中获取当前环境的 history 类型
 * @async
 * @param {Object} kootConfig
 * @returns {String}
 */
module.exports = async (kootConfig) => {
    if (process.env.WEBPACK_BUILD_STAGE === 'server')
        return 'memoryHistory'

    const {
        historyType = process.env.WEBPACK_BUILD_TYPE === 'spa' ? 'hash' : 'browser'
    } = kootConfig
    const type = historyType.replace(/history$/i, '')
    return `${type}History`
}
