/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-console */

import logError from './libs/log-error.js';
import __ from '../../utils/translate.js';
import getAppType from '../../utils/get-app-type.js';
import getAppTypeString from '../../utils/get-app-type-string.js';
import envUpdateAppType from '../env/update-app-type.js';

import '../../typedef.js';

/**
 * Safeguard: App Type
 * - Ensure environment variables updated: `WEBPACK_BUILD_TYPE` `KOOT_PROJECT_TYPE` `KOOT_BUILD_TARGET`
 * - If cannot get a valid app type, throw an error
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
export default async (appConfig = {}) => {
    const appType = await getAppType();
    if (!appType) envUpdateAppType(getAppTypeString(appConfig.type));
    if (!(await getAppType())) {
        logError(__('safeguard.INVALID_CONFIG', { key: 'type' }));
        throw new Error('INVALID_CONFIG:type');
    }
};
