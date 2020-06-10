const path = require('path');
const resolveDir = require('../utils/resolve-dir');

module.exports = {
    type: 'react',
    // target: '',
    dist: './dist',
    cookiesToStore: true,
    sessionStore: false,
    i18n: false,
    serviceWorker: true,
    aliases: {},
    defines: {},

    // before: '',
    // after: '',
    // onRouterUpdate: '',
    // onHistoryUpdate: '',

    port: 8080,
    renderCache: false,
    // serverBefore: '',
    // serverAfter: '',
    // serverOnRender: '',

    webpackBefore() {},
    webpackAfter() {},
    moduleCssFilenameTest: /\.(component|view|module)/,
    classNameHashLength: 6,
    bundleVersionsKeep: 2,
    exportGzip: true,
    // serverPackAll: true,

    devPort: 3080,
    devServiceWorker: false,

    electron: (() => {
        try {
            return {
                main: path.resolve(resolveDir('koot-electron'), 'main.js'),
            };
        } catch (e) {
            return {};
        }
    })(),
};
