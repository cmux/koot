const fs = require('fs-extra')
const path = require('path')
const readBaseConfig = require('../utils/read-base-config')
const getCwd = require('../utils/get-cwd')

const { version } = require('../package.json')

/**
 * 处理模板内容代码并返回最终结果
 * @async
 * @param {String} template 模板文件路径或模板内容代码
 * @returns {String} 处理后的模板内容代码
 */
const validateTemplate = async (template) => {
    if (typeof template === 'undefined')
        template = await readBaseConfig('template')

    if (typeof template !== 'string')
        throw new Error('validate-template: `template` need to be String')

    let templateStr
    if (fs.existsSync(template)) {
        templateStr = await fs.readFile(template, 'utf-8')
    } else if (template.substr(0, 2) === './') {
        templateStr = await fs.readFile(path.resolve(getCwd(), template), 'utf-8')
    } else if (path.isAbsolute(template)) {
        templateStr = await fs.readFile(path.resolve(template), 'utf-8')
    }

    return (templateStr + `\n<!-- rendered by using koot.js ${version} -->`)
}

module.exports = validateTemplate
