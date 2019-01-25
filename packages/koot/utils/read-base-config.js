const fs = require('fs-extra')
const getPathnameProjectConfigFile = require('./get-pathname-project-config-file')

/**
 * 从项目配置中读取对应配置项的内容
 * 
 * 项目配置：在 0.6 之前为 koot.js，0.6 之后为自动生成的临时配置文件
 *   - 使用临时配置文件是为了兼容 0.6 之前的行为
 *   - TODO: 在未来可能会抛弃独立配置文件行为，界时该方法会改写
 * 
 * @async
 * @param {String} key 
 * @returns {*}
 */
module.exports = async (key) => {
    const pathnameKootJS = getPathnameProjectConfigFile()

    try {
        const config = require(pathnameKootJS)
        return config[key]
    } catch (e) { }

    const content = await fs.readFile(pathnameKootJS, 'utf-8')

    {
        const regex = new RegExp(`${key}[ ]*=[ ]*['"](.+?)['"]`, "gm")
        const matches = regex.exec(content)
        if (Array.isArray(matches) && matches.length > 1)
            return matches[1]
    }

    {
        const regex = new RegExp(`${key}[ ]*=[ ]*{(.+?)}`, "gm")
        const matches = regex.exec(content)
        if (Array.isArray(matches) && matches.length > 1) {
            try {
                return JSON.parse(`{${matches[1]}}`)
            } catch (e) {
                const c = matches[1]
                    .replace(/([: ])require\(['"](.+?)['"]\)\.(\w+?)([}, ])/g, '$1"$2:$3"$4')
                    .replace(/([: ])require\(['"](.+?)['"]\)\.(\w+?)$/g, '$1"$2:$3"')
                    .replace(/([: ])require\(['"](.+?)['"]\)([}, ])/g, '$1"$2"$3')
                    .replace(/([: ])require\(['"](.+?)['"]\)$/g, '$1"$2"')
                return JSON.parse(`{${c}}`)
            }
        }
    }

    return undefined
}
