/* eslint-disable no-console */

import fs from 'fs-extra';
import url from 'node:url';
import chalk from 'chalk';

import vars from '../lib/vars.js';
import getLocales from '../lib/get-locales.js';
import _ from '../lib/translate.js';
import checkUpdate from './check-update.js';

/**
 * @typedef {Object} Result
 * @property {boolean} needUpdate
 *           是否需要更新
 */

/**
 * 在 CLI 开始前执行的必要操作和流程
 * @async
 * @returns {Result}
 */
const before = async () => {
    vars.locales = await getLocales();

    const { version } = await fs.readJson(
        url.fileURLToPath(new URL('../package.json', import.meta.url))
    );

    console.log(' ');
    console.log('' + _('current_version') + chalk.cyanBright(version));

    const needUpdate = await checkUpdate();

    return { needUpdate };
};

export default before;
