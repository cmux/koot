/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-console */

import fs from 'fs-extra';
import url from 'node:url';
import semver from 'semver';

import logError from './libs/log-error.js';
import __ from '../../utils/translate.js';

import '../../typedef.js';

/**
 * Safeguard: Node.js
 * - If _Node.js_ installed version dosenot meet requirement, throw an error
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
export default async (appConfig = {}) => {
    const { engines: { node: nodeRequired } = {} } = fs.readJsonSync(
        url.fileURLToPath(new URL('../../package.json', import.meta.url))
    );
    const nodeLocal = semver.valid(semver.coerce(process.version));
    if (!semver.satisfies(nodeLocal, nodeRequired)) {
        logError(
            __('safeguard.NODE_LOCAL_VERSION_NOT_SATISFIED', {
                require: nodeRequired,
                local: nodeLocal,
            })
        );
        throw new Error('NODE_LOCAL_VERSION_NOT_SATISFIED');
    }
};
