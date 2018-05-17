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
    const type = extractType() || ''
    switch (type.toLowerCase()) {
        case 'react': {
            // if ((await readBuildConfigFile()).server)
            //     return 'ReactApp'
            return 'ReactSPA'
        }
        default:
            return type
    }
}
