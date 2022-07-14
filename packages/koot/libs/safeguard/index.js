/* eslint-disable no-console */

/**
 * @module
 * Safeguard mechanism for koot commands
 */

require('../../typedef');

const safeNodejs = require('./nodejs');
const safeAppType = require('./app-type');
const safeElectron = require('./electron');

// ============================================================================

/**
 * Safeguard mechanism for koot commands. If error occurs, throw Error
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
const safeguard = async (appConfig = {}) => {
    await safeNodejs(appConfig);
    await safeAppType(appConfig);
    await safeElectron(appConfig);
};

module.exports = safeguard;
