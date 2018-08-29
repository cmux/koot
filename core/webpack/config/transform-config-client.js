const path = require('path')

const common = require('../common')

/**
 * Webpack 配置处理 - 客户端配置
 * @async
 * @param {Object} input 
 * @param {String} input.appType
 * @param {Object} input.i18n
 * @param {Function} input.createBaseConfig
 * @returns {Object} 处理后的配置
 */
module.exports = async (input = {}) => {
    const {
        appType,
        i18n,
        createBaseConfig,
    } = input

    if (typeof i18n === 'object') {
        const {
            type = 'default'
        } = i18n
        switch (type) {
            case 'redux': {
                await handleSingleConfig()
                break
            }
            default: {
                for (let arr of i18n.locales) {
                    await handleSingleConfig(arr[0], arr[1])
                }
            }
        }
    } else {
        await handleSingleConfig()
    }

    const handleSingleConfig = async (localeId, localesObj) => {
        const baseConfig = await createBaseConfig()
        delete baseConfig.module.rules

        const defaultConfig = await createDefaultConfig(opt)
    }
}
