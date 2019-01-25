const getLocalesConfig = require('./get-locales-config')

let result

/**
 * 获取 i18n 语种列表
 * @returns {Array}
 */
module.exports = (() => {
    if (!Array.isArray(result)) {
        result = getLocalesConfig()
        result = result.map(l => l[0])

        if (!result.length)
            result = ['']
    }

    return result
})()
