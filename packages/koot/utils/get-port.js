// require('./init-node-env')()

/**
 * 获取当前环境的服务器端口号
 * @param {Object|Number} port 
 * @param {String} [env=process.env.WEBPACK_BUILD_ENV] 
 * @returns {Number}
 */
module.exports = (port, env = process.env.WEBPACK_BUILD_ENV) => {
    const defaultPort = typeof process.env.SERVER_PORT === 'undefined' && typeof __SERVER_PORT__ !== 'undefined'
        ? __SERVER_PORT__
        : process.env.SERVER_PORT

    if (typeof port === 'object') {
        if (!env) env = 'prod'
        if (typeof port[env] !== 'undefined')
            return port[env]
        return defaultPort
    }

    if (typeof port !== 'undefined' && typeof port !== 'boolean')
        return port

    return defaultPort
}
