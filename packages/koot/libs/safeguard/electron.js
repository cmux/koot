/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-console */

import resolve from 'resolve';

import logError from './libs/log-error.js';
import __ from '../../utils/translate.js';
import getCwd from '../../utils/get-cwd.js';

import '../../typedef.js';

/**
 * Safeguard: Electron
 * - If module `koot-electron` not found, throw an error
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
export default async (appConfig = {}) => {
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
