const fs = require('fs-extra')
const path = require('path')
const readBaseConfig = require('../../../utils/read-base-config')
const getCwd = require('../../../utils/get-cwd')

// ERROR: `package` is a reserved word
const p = require('../../../package.json')

/**
 * 处理 HTML 基础模板配置。以下内容写入环境变量
 *   - KOOT_HTML_TEMPLATE - 模板内容
 *
 * @async
 * @param {*} template
 * @return {Boolean|String} 模板内容
 */
module.exports = async (template) => {
    if (typeof process.env.KOOT_HTML_TEMPLATE !== 'string') {
        if (typeof template === 'undefined')
            template = await readBaseConfig('template')

        if (typeof template === 'string') {
            if (template.substr(0, 2) === './') {
                template = await fs.readFile(path.resolve(getCwd(), template))
            } else if (path.isAbsolute(template)) {
                template = await fs.readFile(path.resolve(template))
            }

            let temp = template.toString();
            temp += '<!-- rendered by using koot.js ' + p.version + '-->';

            // WARNING: Buffer() is deprecated
            process.env.KOOT_HTML_TEMPLATE = Buffer.from(temp)
        }
    }
    return template
}
