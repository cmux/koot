const fs = require('fs')
const path = require('path')

/**
 * 引用 koot 主包中的文件
 * @param {String} theModule module 名
 * @returns {*} module
 */
module.exports = (theModule) => {
    try {
        return require(`koot/${theModule}`)
    } catch (e) {
        let file = path.resolve(__dirname, '../../koot', theModule)

        if (fs.existsSync(file))
            return require(file)

        if (fs.existsSync(file + '.js'))
            return require(file + '.js')

        if (fs.existsSync(file + '.jsx'))
            return require(file + '.jsx')
    }
}
