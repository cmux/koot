const isPortReachable = require('is-port-reachable')
const getFreePort = require('../libs/require-koot')('libs/get-free-port')

/**
 * 仅限开发环境
 * 返回可用的 webpack-dev-server 端口
 * @async
 * @param {Number|Number[]|Object} 正在使用的端口
 * @returns {Number} 最终确定的 webpack-dev-server 端口
 */
module.exports = async (portUsed) => {

    // 检查环境变量中设定的端口，如果可用，直接返回结果
    if (isNumber(process.env.WEBPACK_DEV_SERVER_PORT)) {
        const port = parseInt(process.env.WEBPACK_DEV_SERVER_PORT)
        const isPortOpen = !(await isPortReachable(port))
        if (isPortOpen)
            return port
    }

    return await getFreePort(portUsed)
}

const isNumber = (value) => Boolean(
    typeof value === 'number' ||
    !isNaN(value)
)
