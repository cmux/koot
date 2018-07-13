require('./init-node-env')()

/**
 * 获取当前环境的服务器端口号
 * @param {Object|Number} port 
 * @param {String} [env=process.env.WEBPACK_BUILD_ENV] 
 * @returns {Number}
 */
module.exports = (port, env = process.env.WEBPACK_BUILD_ENV) => {
    if (typeof port === 'object') {
        if (typeof port[env] !== 'undefined')
            return port[env]
        return process.env.SERVER_PORT
    }

    if (typeof port !== 'undefined' && typeof port !== 'boolean')
        return port

    return process.env.SERVER_PORT
}
