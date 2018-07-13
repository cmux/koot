const fs = require('fs')
const path = require('path')
// const readBuildConfigFile = require('../utils/read-build-config-file')

const extractType = () => {
    const pathnameSuperJS = path.resolve(__dirname, '../../../super.js')

    try {
        const { type } = require(pathnameSuperJS)
        return type
    } catch (e) { }

    const content = fs.readFileSync(pathnameSuperJS, 'utf-8')
    const matches = /type[ ]*=[ ]*['"](.+?)['"]/gm.exec(content)
    if (Array.isArray(matches) && matches.length > 1)
        return matches[1]

    return undefined
}

/**
 * 从核心配置文件 (./super.js) 中读取 App 类型 (type)，并修改部分环境变量
 * * WEBPACK_BUILD_TYPE: 'isomorphic' || 'spa' || etc...
 * * SUPER_PROJECT_TYPE: 'ReactApp' || 'ReactSPA' || etc...
 * @async
 * @returns {String} process.env.SUPER_PROJECT_TYPE
 */
module.exports = async () => {
    if (typeof process.env.SUPER_PROJECT_TYPE === 'undefined') {
        process.env.SUPER_PROJECT_TYPE = extractType() || ''
    }

    switch (process.env.SUPER_PROJECT_TYPE.toLowerCase()) {
        case 'react': {
            // if ((await readBuildConfigFile()).server)
            process.env.WEBPACK_BUILD_TYPE = 'isomorphic'
            process.env.SUPER_PROJECT_TYPE = 'ReactApp'
            // return 'ReactSPA'
            break
        }

        case 'react-spa':
        case 'reactspa': {
            process.env.WEBPACK_BUILD_TYPE = 'spa'
            process.env.SUPER_PROJECT_TYPE = 'ReactSPA'
            break
        }

        // default:
        //     return process.env.SUPER_PROJECT_TYPE
    }

    return process.env.SUPER_PROJECT_TYPE
}
