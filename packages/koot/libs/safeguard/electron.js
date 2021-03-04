/* eslint-disable no-console */

require('../../typedef');

const resolve = require('resolve');

const logError = require('./libs/log-error');
const __ = require('../../utils/translate');
const getCwd = require('../../utils/get-cwd');

/**
 * Safeguard: Electron
 * - If module `koot-electron` not found, throw an error
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
module.exports = async (appConfig = {}) => {
    const isElectronApp =
        appConfig.target === 'electron' ||
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
                logError(__('safeguard.NEED_PACKAGE_KOOT_ELECTRON'));
            }
            throw err;
        });
    }
};
