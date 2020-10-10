/* eslint-disable no-console */

/**
 * @module
 * Safeguard mechanism for koot commands
 */

const resolve = require('resolve');
const log = require('./log');
const __ = require('../utils/translate');
const getCwd = require('../utils/get-cwd');
const getAppType = require('../utils/get-app-type');
const getAppTypeString = require('../utils/get-app-type-string');
const envUpdateAppType = require('./env/update-app-type');

/**
 * Safeguard mechanism for koot commands. If error occurs, throw Error
 * @async
 * @void
 */
const safeguard = async (kootConfig = {}) => {
    // ========================================================================
    //
    // Ensure App Type related env
    //
    // ========================================================================
    const appType = await getAppType();
    if (!appType) envUpdateAppType(getAppTypeString(kootConfig.type));
    if (!(await getAppType())) {
        console.log(' ');
        log('error', __('safeguard.INVALID_CONFIG', { key: 'type' }));
        console.log(' ');
        console.log(' ');
        throw new Error('INVALID_CONFIG:type');
    }

    // ========================================================================
    //
    // Node.js
    //
    // ========================================================================
    // TODO 判断 node 版本

    // ========================================================================
    //
    // Electron
    //
    // ========================================================================
    const isElectronApp =
        kootConfig.target === 'electron' ||
        process.env.KOOT_BUILD_TARGET === 'electron';
    if (isElectronApp) {
        await new Promise((r, reject) => {
            resolve('koot-electron', { basedir: getCwd() }, (err, res) => {
                if (err) reject(err);
                else r(res);
            });
        }).catch((err) => {
            if (err.code === 'MODULE_NOT_FOUND') {
                err.message = 'NEED_PACKAGE_KOOT_ELECTRON';
                console.log(' ');
                log('error', __('safeguard.NEED_PACKAGE_KOOT_ELECTRON'));
                console.log(' ');
                console.log(' ');
            }
            throw err;
        });
    }
};

module.exports = safeguard;
