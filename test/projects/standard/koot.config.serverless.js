const baseConfig = require('./koot.config');

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-serverless/',
    serverless: true
});
