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

    moduleCssFilenameTest: /\.(component|view|module)/,
    classNameHashLength: 6,
    bundleVersionsKeep: 2,
    exportGzip: true,
    // serverPackAll: true,

    devPort: 3080,
    devServiceWorker: false,

    electron: {
        main: 'koot-electron/main.js',
    },
};
