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
 * 根据 KOOT_PROJECT_TYPE 环境变量确定项目类型 (type)，并修改/写入以下环境变量
 *   - WEBPACK_BUILD_TYPE: 'isomorphic' || 'spa' || etc...
 *   - KOOT_PROJECT_TYPE: 'ReactApp' || 'ReactSPA' || etc...
 * 
 * 如果该环境变量未指定或为空值，则会尝试从项目配置中读取
 * 
 * 项目配置：在 0.6 之前为 koot.js，0.6 之后为自动生成的临时配置文件
 *   - 使用临时配置文件是为了兼容 0.6 之前的行为
 *   - TODO: 在未来可能会抛弃独立配置文件行为，界时该方法会改写
 * 
 * @async
 * @param {String} [projectType] 指定项目类型，如果指定会强制采用该值
 * @returns {String} process.env.KOOT_PROJECT_TYPE
 */
module.exports = async (projectType = process.env.KOOT_PROJECT_TYPE) => {
    if (!projectType) {
        projectType = extractType() || ''
    }

    switch (projectType.toLowerCase()) {
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

    return projectType
}
