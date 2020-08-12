const path = require('path');

const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: path.resolve(__dirname, 'dist-electron'),
    type: 'react-spa',
    target: 'electron',
    electron: {
        build: {
            directories: {
                output: '.dist',
            },
        },
    },
});
