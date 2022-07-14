/* eslint-disable no-console */

require('../../typedef');

const logError = require('./libs/log-error');
const __ = require('../../utils/translate');
const getAppType = require('../../utils/get-app-type');
const getAppTypeString = require('../../utils/get-app-type-string');
const envUpdateAppType = require('../env/update-app-type');

/**
 * Safeguard: App Type
 * - Ensure environment variables updated: `WEBPACK_BUILD_TYPE` `KOOT_PROJECT_TYPE` `KOOT_BUILD_TARGET`
 * - If cannot get a valid app type, throw an error
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
module.exports = async (appConfig = {}) => {
    const appType = await getAppType();
    if (!appType) envUpdateAppType(getAppTypeString(appConfig.type));
    if (!(await getAppType())) {
        logError(__('safeguard.INVALID_CONFIG', { key: 'type' }));
        throw new Error('INVALID_CONFIG:type');
    }
};
