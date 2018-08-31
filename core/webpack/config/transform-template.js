const fs = require('fs-extra')
const path = require('path')
const readBaseConfig = require('../../../utils/read-base-config')
const getCwd = require('../../../utils/get-cwd')

/**
 * 处理 HTML 基础模板配置
 * @async
 * @param {*} template
 * @return {Boolean|String}
 */
module.exports = async (template) => {
    if (typeof process.env.KOOT_HTML_TEMPLATE !== 'string') {
        if (typeof template === 'undefined')
            template = await readBaseConfig('template')

        if (typeof template === 'string' && template.substr(0, 2) === './') {
            template = await fs.readFile(path.resolve(
                getCwd(), template
            ))
            process.env.KOOT_HTML_TEMPLATE = template
        }
    }
    return template
}
