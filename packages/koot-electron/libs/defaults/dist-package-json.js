const { electron = {} } = require('koot/defaults/koot-config');
const { packedFilesFolderName } = require('../constants');

module.exports = {
    name: 'kootjs-electron-app',
    description: 'A Certain Electron App of Koot.js',
    scripts: {
        start: 'electron .',
    },
    main: electron.mainOutput,
    private: true,
    devDependencies: {
        electron: require('../../package.json').dependencies.electron,
    },
    version: '0.0.1',
    build: {
        directories: {
            output: packedFilesFolderName,
        },
    },
};
