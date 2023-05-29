/* eslint-disable import/no-anonymous-default-export */

export const publicPathPrefix = '__koot_webpack_dev_server__';
export const entryClientHMR = 'webpack-dev-server-client';

export const serviceWorkerFilename = '__KOOT_DEV_SERVICE_WORKER__.js';

// export const hmrOptions = {
//     multiStep: true,
//     fullBuildTimeout: process.env.WEBPACK_BUILD_TYPE === 'spa' ? 500 : undefined,
//     requestTimeout: process.env.WEBPACK_BUILD_TYPE === 'spa' ? undefined : 1000
// }
export const hmrOptions = undefined;

export default {
    publicPathPrefix,
    entryClientHMR,

    serviceWorkerFilename,

    // hmrOptions,
    hmrOptions,
};
