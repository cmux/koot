const { KOOT_CLIENT_PUBLIC_PATH } = require('../defaults/envs');
const getWDSport = require('./get-webpack-dev-server-port');

let publicPath;
let publicPathSSRReading;

/**
 * 获取浏览器环境中的访问根路径
 * @param {Boolean} [isSSRReading = false] 如果标记为 true，表示用于 SSR 时读取文件，会对 publicPath 进行特殊处理
 * @returns {String} 浏览器环境中的访问根路径
 */
module.exports = (isSSRReading = false) => {
    if (isSSRReading && typeof publicPathSSRReading === 'string')
        return publicPathSSRReading;
    if (typeof publicPath === 'string') return publicPath;

    const isDev =
        process.env.WEBPACK_BUILD_ENV === 'dev' ||
        (typeof __DEV__ !== 'undefined' && __DEV__);

    if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
        publicPath = isDev
            ? '/'
            : /^browser/.test(process.env.KOOT_HISTORY_TYPE)
            ? typeof process.env[KOOT_CLIENT_PUBLIC_PATH] === 'string'
                ? process.env[KOOT_CLIENT_PUBLIC_PATH]
                : '/'
            : '';
        publicPathSSRReading = publicPath;
    } else if (isDev) {
        const port = getWDSport();
        const origin =
            typeof global.koaCtxOrigin === 'string'
                ? global.koaCtxOrigin.split(':').slice(0, 2).join(':')
                : 'http://localhost';
        publicPath = `${origin}:${port}/dist/`;
        publicPathSSRReading = publicPath;
    } else if (typeof process.env.KOOT_SSR_PUBLIC_PATH === 'string') {
        publicPath = JSON.parse(process.env.KOOT_SSR_PUBLIC_PATH);
        publicPathSSRReading = '/';
    } else {
        publicPath = `/`;
        publicPathSSRReading = publicPath;
    }

    if (isSSRReading) return publicPathSSRReading;
    return publicPath;
};
