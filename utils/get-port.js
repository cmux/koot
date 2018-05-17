module.exports = (port, env = process.env.WEBPACK_BUILD_ENV) => {
    const {
        SERVER_PORT,
    } = process.env

    if (typeof port === 'object') {
        if (typeof port[env] !== 'undefined')
            return port[env]
        return SERVER_PORT
    }

    if (typeof port !== 'undefined' && typeof port !== 'boolean')
        return port

    return SERVER_PORT
}
