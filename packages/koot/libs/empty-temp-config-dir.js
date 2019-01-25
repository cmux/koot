const fs = require('fs-extra')
const path = require('path')

const { dirConfigTemp: _dirConfigTemp } = require('../defaults/before-build')
const getCwd = require('../utils/get-cwd')

/**
 * 清空临时配置文件目录
 * @param {String} cwd 
 */
const run = (cwd = getCwd()) => {
    const dirConfigTemp = path.resolve(cwd, _dirConfigTemp)
    if (fs.existsSync(dirConfigTemp)) {
        fs.emptyDirSync(dirConfigTemp)
    }
}

module.exports = run
