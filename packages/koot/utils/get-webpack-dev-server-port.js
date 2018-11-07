/**
 * 获取 webpack-dev-server 端口号
 * @returns {Number}
 */
module.exports = () => {
    // console.log('process.env.WEBPACK_DEV_SERVER_PORT', process.env.WEBPACK_DEV_SERVER_PORT)
    return process.env.WEBPACK_DEV_SERVER_PORT || 3001
}
