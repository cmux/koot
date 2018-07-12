const fs = require('fs-extra')
const path = require('path')

/**
 * 从 super.js 中读取对应配置
 * @param {String} key 
 */
module.exports = async (key) => {
    const pathnameSuperJS = path.resolve(__dirname, '../../../super.js')

    try {
        const config = require(pathnameSuperJS)
        return config[key]
    } catch (e) { }

    const content = await fs.readFile(pathnameSuperJS, 'utf-8')
    const regex = new RegExp(`${key}[ ]*=[ ]*['"](.+?)['"]`, "gm")
    const matches = regex.exec(content)

    if (Array.isArray(matches) && matches.length > 1)
        return matches[1]

    return undefined
}
