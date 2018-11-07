const path = require('path')
const getCwd = require('./get-cwd')

let p

/**
 * 获取打包结果路径
 * @returns {String} 打包结果路径 (硬盘绝对路径)
 */
module.exports = () => {
    // console.log('global.KOOT_DIST_DIR', global.KOOT_DIST_DIR)
    if (typeof p !== 'string') {
        p = typeof global.KOOT_DIST_DIR === 'string'
            ? global.KOOT_DIST_DIR
            : path.resolve(getCwd(), process.env.KOOT_DIST_DIR)
    }
    return p
}
