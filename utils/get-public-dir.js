module.exports = () => {
    const isDev = process.env.WEBPACK_BUILD_ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__)

    if (process.env.WEBPACK_BUILD_TYPE === 'spa')
        return isDev ? '/' : ''

    return isDev
        ? `http://localhost:${process.env.WEBPACK_DEV_SERVER_PORT || 3001}/dist/`
        : '/'
}
