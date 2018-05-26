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
