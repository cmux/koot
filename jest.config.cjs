// const { defaults } = require('jest-config')
/** @type {import('jest').Config} */
const config = {
    // verbose: true,
    // setupTestFrameworkScriptFile: './test/jest-setup.js',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/packages/.+/node_modules/',
        '/test/projects/',
        '/logs/',
    ],
    // transformIgnorePatterns: ['.js$'],
    // transform: {},
};

module.exports = config;
