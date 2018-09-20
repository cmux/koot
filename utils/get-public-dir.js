const getWDSport = require('./get-webpack-dev-server-port')

/**
 * 获取浏览器环境中的访问根路径
 * @returns {String} 浏览器环境中的访问根路径
 */
module.exports = () => {
    const isDev = process.env.WEBPACK_BUILD_ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__)

    if (process.env.WEBPACK_BUILD_TYPE === 'spa')
        return isDev ? '/' : ''

    if (isDev) {
        const port = getWDSport()
        const origin = typeof global.koaCtxOrigin === 'string'
            ? global.koaCtxOrigin.split(':').slice(0, 2).join(':')
            : 'http://localhost'
        return `${origin}:${port}/dist/`
    }

    return '/'
}
