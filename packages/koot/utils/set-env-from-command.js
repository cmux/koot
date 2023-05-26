/* eslint-disable no-console */

import path from 'path';
import chalk from 'chalk';

import getAppTypeString from './get-app-type-string.js';
import __ from './translate.js';
import envUpdateAppType from '../libs/env/update-app-type.js';

/**
 * 从命令确定环境变量
 * @param {Object} Settings
 */
const setEnvFromCommand = ({ config, type, port }, quiet = false) => {
    let modified = false;
    const log = (key, value) => {
        if (quiet) return;
        console.log(
            chalk.green('√ ') +
                chalk.yellowBright('[koot] ') +
                `set process.env.` +
                chalk.green(key) +
                `\n      -> ` +
                value
        );
    };

    if (typeof config === 'string') {
        config = path.resolve(config);
        process.env.KOOT_BUILD_CONFIG_PATHNAME = config;
        log('KOOT_BUILD_CONFIG_PATHNAME', config);
        modified = true;
    }

    if (typeof type === 'string') {
        process.env.KOOT_PROJECT_TYPE = getAppTypeString(type);
        envUpdateAppType(process.env.KOOT_PROJECT_TYPE);
        log(
            'KOOT_PROJECT_TYPE',
            process.env.KOOT_PROJECT_TYPE +
                ` (${__(`appType.${process.env.KOOT_PROJECT_TYPE}`)})`
        );
        modified = true;
    }

    if (typeof port === 'string' || typeof port === 'number') {
        process.env.SERVER_PORT = port;
        log('SERVER_PORT', port);
        modified = true;
    }

    if (modified) console.log(' ');

    return {
        config,
        type,
        port,
    };
};

export default setEnvFromCommand;
