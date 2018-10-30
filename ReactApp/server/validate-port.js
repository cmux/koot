const isPortReachable = require('is-port-reachable')

/**
 * 验证服务器启动端口
 * 
 * 依次检查以下变量/常量，当发现可用值时进入下一步
 *     __SERVER_PORT__
 *     process.env.SERVER_PORT
 * 
 * 检查设定好的端口号是否可用
 * 如果可用，直接返回结果
 * 如果不可用，提示下一步操作
 * 
 * @async
 * @returns {Number|Boolean} 如果最终没有结果，返回 false，否则返回可用的端口数
 */
module.exports = async () => {
    if (typeof process.env.SERVER_PORT === 'undefined' && typeof __SERVER_PORT__ !== 'undefined')
        process.env.SERVER_PORT = __SERVER_PORT__

    return await validate(process.env.SERVER_PORT)
}

const validate = async (port) => {
    const isPortOpen = !(await isPortReachable(port))
    if (isPortOpen)
        return port
    return false
}
