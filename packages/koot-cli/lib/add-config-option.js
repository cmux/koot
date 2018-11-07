const fs = require('fs-extra')

const getConfigFile = require('./get-config-file')
const readConfigFile = require('./read-config-file')

/**
 * 添加配置项
 * @async
 * @param {String} dir 项目路径
 * @param {String} name 项名
 * @param {*} value 初始值
 * @param {String[]} comments 注释区域
 * @param {Boolean} overwrite 是否覆盖配置文件内的项目
 * @returns {Object} 修改后的配置对象
 */
module.exports = async (cwd = process.cwd(), name, value, comments = [], overwrite = false) => {
    const file = await getConfigFile(cwd)
    const p = await readConfigFile(cwd)

    if (typeof p[name] !== 'undefined' && !overwrite)
        return p

    const content = await fs.readFile(file, 'utf-8')

    Object.defineProperty(RegExp.prototype, "toJSON", {
        value: RegExp.prototype.toString
    })

    const getValue = () => {
        if (typeof value === 'object') {
            return JSON.stringify(value, undefined, 4)
                .replace(/\n([ ]*)/g, '\n    $1')
        }

        return value
    }

    const getComments = () => {
        if (Array.isArray(comments) && comments.length) {
            return `    /**\n`
                + comments.map(s => `     * ${s}`).join('\n')
                + '\n'
                + '     */\n'
        }

        return ''
    }

    await fs.writeFile(
        file,
        content.replace(/{/, `{\n${getComments()}    ${name}: ${getValue()},\n`),
        'utf-8'
    )
}
