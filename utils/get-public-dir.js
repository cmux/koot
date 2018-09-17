/**
 * 获取浏览器环境中的访问根路径
 * @returns {String} 浏览器环境中的访问根路径
 */
module.exports = () => {
    const isDev = process.env.WEBPACK_BUILD_ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__)

    if (process.env.WEBPACK_BUILD_TYPE === 'spa')
        return isDev ? '/' : ''

    return isDev
        ? `${typeof global.koaCtxOrigin === 'string'
            ? global.koaCtxOrigin.split(':').slice(0, 2).join(':')
            : 'http://localhost'
        }:${process.env.WEBPACK_DEV_SERVER_PORT || 3001}/dist/`
        : '/'
}
