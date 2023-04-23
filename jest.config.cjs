// const { defaults } = require('jest-config')

module.exports = {
    // verbose: true,
    // setupTestFrameworkScriptFile: './test/jest-setup.js',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/packages/.+/node_modules/',
        '/test/projects/',
        '/logs/',
    ],
};
