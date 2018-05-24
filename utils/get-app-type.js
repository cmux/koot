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

module.exports = async () => {
    const type = typeof process.env.SUPER_PROJECT_TYPE !== 'undefined'
        ? process.env.SUPER_PROJECT_TYPE
        : extractType() || ''

    switch (type.toLowerCase()) {
        case 'react': {
            // if ((await readBuildConfigFile()).server)
            process.env.WEBPACK_BUILD_TYPE = 'isomorphic'
            return 'ReactApp'
            // return 'ReactSPA'
        }

        case 'react-spa':
        case 'reactspa': {
            process.env.WEBPACK_BUILD_TYPE = 'spa'
            return 'ReactSPA'
        }

        default:
            return type
    }
}
