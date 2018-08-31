const fs = require('fs-extra')
const getPathnameProjectConfigFile = require('./get-pathname-project-config-file')

/**
 * 从 koot.js 中读取对应配置
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
    const regex = new RegExp(`${key}[ ]*=[ ]*['"](.+?)['"]`, "gm")
    const matches = regex.exec(content)

    if (Array.isArray(matches) && matches.length > 1)
        return matches[1]

    return undefined
}
