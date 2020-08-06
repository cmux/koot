const path = require('path');
const resolveDir = require('../utils/resolve-dir');

/**
 * Koot App (Koot.js 项目) 配置默认值
 */
module.exports = {
    // 项目基本信息
    // name: '',
    type: 'react',
    // target: '',
    dist: './dist',
    cookiesToStore: true,
    sessionStore: false,
    i18n: false,
    serviceWorker: true,
    // icon: '', // 模板中会提供默认图标
    webApp: false,
    aliases: {},
    defines: {},
    electron: (() => {
        try {
            return {
                main: path.resolve(resolveDir('koot-electron'), 'main.js'),
                mainOutput: 'main.js',
            };
        } catch (e) {
            return {};
        }
    })(),

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
};
