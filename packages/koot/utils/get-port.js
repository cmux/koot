// require('./init-node-env')()

/**
 * 获取 Web 服务器端口号
 * @param {Object|number} port
 * @param {string} [env=process.env.WEBPACK_BUILD_ENV]
 * @returns {number}
 */
module.exports = (port, env = process.env.WEBPACK_BUILD_ENV) => {
    // console.log({
    //     ENV: process.env.WEBPACK_BUILD_ENV,
    //     SERVER_PORT: process.env.SERVER_PORT,
    //     __SERVER_PORT__: __SERVER_PORT__
    // });
    const defaultPort =
        process.env.WEBPACK_BUILD_ENV === 'prod' &&
        typeof process.env.SERVER_PORT !== 'undefined'
            ? process.env.SERVER_PORT
            : /* typeof process.env.SERVER_PORT === 'undefined' && */ typeof __SERVER_PORT__ !==
              'undefined'
            ? __SERVER_PORT__
            : process.env.SERVER_PORT;

    if (typeof port === 'object') {
        if (!env) env = 'prod';
        if (typeof port[env] !== 'undefined') return port[env];
        return defaultPort;
    }

    if (typeof port !== 'undefined' && typeof port !== 'boolean') return port;

    return defaultPort;
};
