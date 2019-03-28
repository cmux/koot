const fs = require('fs-extra')
const path = require('path')

const getCwd = require('../utils/get-cwd')

/**
 * 根据输入的字符串返回合法、存在的路径名
 * @param {String} str
 * @param {String} [cwd]
 * @returns {String}
 */
module.exports = (str, cwd = '.') => {

    if (isExist(str))
        return str

    {
        const p = path.resolve(cwd, str)
        if (isExist(p))
            return p
    }

    {
        const p = path.resolve(process.cwd(), str)
        if (isExist(p))
            return p
    }

    {
        const p = path.resolve(getCwd(), str)
        if (isExist(p))
            return p
    }

    {
        const p = path.resolve(getCwd(), 'node_modules', str)
        if (isExist(p))
            return p
    }

    return str
}

const isExist = (pathname) => {
    if (fs.existsSync(pathname))
        return true

    if (fs.existsSync(pathname + '.js'))
        return true

    if (fs.existsSync(pathname + '.mjs'))
        return true

    if (fs.existsSync(pathname + '.jsx'))
        return true

    return false
}
