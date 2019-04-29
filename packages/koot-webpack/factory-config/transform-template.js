const validateTemplate = require('../libs/require-koot')('libs/validate-template')
const readBaseConfig = require('../libs/require-koot')('utils/read-base-config')

/**
 * 处理 HTML 基础模板配置。以下内容写入环境变量
 *   - KOOT_HTML_TEMPLATE - 模板内容
 *
 * @async
 * @param {*} template
 * @return {Boolean|String} 模板内容
 */
module.exports = async (template) => {
    if (typeof template === 'undefined')
        template = await readBaseConfig('template')

    if (typeof process.env.KOOT_HTML_TEMPLATE !== 'string') {
        process.env.KOOT_HTML_TEMPLATE = await validateTemplate(template)
    }
    return template
}
