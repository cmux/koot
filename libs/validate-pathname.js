const fs = require('fs-extra')
const path = require('path')

const getCwd = require('../utils/get-cwd')

/**
 * 根据输入的字符串返回合法、存在的路径名
 * @param {String} str
 * @returns {String}
 */
module.exports = (str, cwd = '.') => {
    if (fs.existsSync(str))
        return str

    {
        const p = path.resolve(cwd, str)
        if (fs.existsSync(p))
            return p
    }

    {
        const p = path.resolve(process.cwd(), str)
        if (fs.existsSync(p))
            return p
    }

    {
        const p = path.resolve(getCwd(), str)
        if (fs.existsSync(p))
            return p
    }

    {
        const p = path.resolve(getCwd(), 'node_modules', str)
        if (fs.existsSync(p))
            return p
    }

    return str
}
