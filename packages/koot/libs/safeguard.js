/* eslint-disable no-console */

/**
 * @module
 * Safeguard mechanism for koot commands
 */

const resolve = require('resolve');
const log = require('./log');
const __ = require('../utils/translate');
const getCwd = require('../utils/get-cwd');

/**
 * Safeguard mechanism for koot commands. If error occurs, throw Error
 * @async
 * @void
 */
const safeguard = async (kootConfig = {}) => {
    const isElectronApp =
        kootConfig.target === 'electron' ||
        process.env.KOOT_BUILD_TARGET === 'electron';

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
