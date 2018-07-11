const path = require('path')

let p

/**
 * 获取打包结果路径
 */
module.exports = () => {
    if (typeof p !== 'string')
        p = path.resolve(process.cwd(), process.env.SUPER_DIST_DIR)
    return p
}
