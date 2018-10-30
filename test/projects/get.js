const fs = require('fs-extra')
const path = require('path')

/**
 * 获取所有测试项目
 * @async
 * @returns {Object[]}
 */
module.exports = () =>
    fs.readdirSync(__dirname)
        .filter(filename => {
            const pathname = path.resolve(__dirname, filename)
            const stat = fs.lstatSync(pathname)

            if (!stat.isDirectory())
                return false

            const filePackagejson = path.resolve(pathname, 'package.json')

            if (!fs.existsSync(filePackagejson))
                return false

            return true
        })
        .map(filename => ({
            name: filename,
            dir: path.resolve(__dirname, filename),
            // type: []
        }))
