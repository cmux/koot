/* eslint-disable no-console */

require('../../typedef');

const semver = require('semver');

const logError = require('./libs/log-error');
const __ = require('../../utils/translate');

const kootPackage = require('../../package.json');

/**
 * Safeguard: Node.js
 * - If _Node.js_ installed version dosenot meet requirement, throw an error
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
module.exports = async (appConfig = {}) => {
    const { engines: { node: nodeRequired } = {} } = kootPackage;
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
