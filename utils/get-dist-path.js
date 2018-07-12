const path = require('path')

let p

/**
 * 获取打包结果路径
 */
module.exports = () => {
    // console.log('global.SUPER_DIST_DIR', global.SUPER_DIST_DIR)
    if (typeof p !== 'string') {
        p = typeof global.SUPER_DIST_DIR === 'string'
            ? global.SUPER_DIST_DIR
            : path.resolve(process.cwd(), process.env.SUPER_DIST_DIR)
    }
    return p
}
