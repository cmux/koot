/**
 * [开发环境] 特殊的请求 URI
 */
module.exports = {
    dll: '/__koot_dev_dll',
    serviceWorker: `/__KOOT_DEV_SERVICE_WORKER.${
        process.env.KOOT_PROJECT_NAME
            ? encodeURIComponent(process.env.KOOT_PROJECT_NAME)
            : '_'
    }.js`
};
