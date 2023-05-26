/* eslint-disable no-console */

/**
 * @module
 * Safeguard mechanism for koot commands
 */

import '../../typedef.js';

import safeNodejs from './nodejs.js';
import safeAppType from './app-type.js';
import safeElectron from './electron.js';

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

export default safeguard;
