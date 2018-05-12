module.exports = (port) => {
    const {
        WEBPACK_BUILD_ENV: ENV,
        SERVER_PORT,
    } = process.env

    if (typeof port === 'object') {
        if (typeof port[ENV] !== 'undefined')
            return port[ENV]
        return SERVER_PORT
    }

    if (typeof port !== 'undefined')
        return port

    return SERVER_PORT
}