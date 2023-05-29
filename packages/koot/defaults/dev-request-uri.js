/* eslint-disable import/no-anonymous-default-export */

export const dll = '/__koot_dev_dll';
export const serviceWorker = `/__KOOT_DEV_SERVICE_WORKER.${
    process.env.KOOT_PROJECT_NAME
        ? encodeURIComponent(process.env.KOOT_PROJECT_NAME)
        : '_'
}.js`;

/**
 * [开发环境] 特殊的请求 URI
 */
export default {
    dll,
    serviceWorker,
};
