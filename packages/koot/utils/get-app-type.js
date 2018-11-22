const fs = require('fs')
const getPathnameProjectConfigFile = require('./get-pathname-project-config-file')
// const readBuildConfigFile = require('../utils/read-build-config-file')

const extractType = () => {
    const pathnameKootJS = getPathnameProjectConfigFile()

    try {
        const { type } = require(pathnameKootJS)
        return type
    } catch (e) { }

    const content = fs.readFileSync(pathnameKootJS, 'utf-8')
    const matches = /type[ ]*=[ ]*['"](.+?)['"]/gm.exec(content)
    if (Array.isArray(matches) && matches.length > 1)
        return matches[1]

    return undefined
}

/**
 * 从核心配置文件 (./koot.js) 中读取 App 类型 (type)，并修改部分环境变量
 * * WEBPACK_BUILD_TYPE: 'isomorphic' || 'spa' || etc...
 * * KOOT_PROJECT_TYPE: 'ReactApp' || 'ReactSPA' || etc...
 * @async
 * @returns {String} process.env.KOOT_PROJECT_TYPE
 */
module.exports = async () => {
    if (typeof process.env.KOOT_PROJECT_TYPE === 'undefined') {
        process.env.KOOT_PROJECT_TYPE = extractType() || ''
    }

    switch (process.env.KOOT_PROJECT_TYPE.toLowerCase()) {
        case 'isomorphic':
        case 'react':
        case 'react-isomorphic':
        case 'react_isomorphic':
        case 'reactisomorphic': {
            // if ((await readBuildConfigFile()).server)
            process.env.WEBPACK_BUILD_TYPE = 'isomorphic'
            process.env.KOOT_PROJECT_TYPE = 'ReactApp'
            // return 'ReactSPA'
            break
        }

        case 'spa':
        case 'react-spa':
        case 'react_spa':
        case 'reactspa': {
            process.env.WEBPACK_BUILD_TYPE = 'spa'
            process.env.KOOT_PROJECT_TYPE = 'ReactSPA'
            break
        }

        // default:
        //     return process.env.KOOT_PROJECT_TYPE
    }

    return process.env.KOOT_PROJECT_TYPE
}
