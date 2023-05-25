/* eslint-disable no-console */

import fs from 'fs-extra';
import url from 'node:url';
import latestVersion from 'latest-version';
import semver from 'semver';
import chalk from 'chalk';

import vars from '../lib/vars.js';
import getLocales from '../lib/get-locales.js';
import spinner from '../lib/spinner.js';
import _ from '../lib/translate.js';

/**
 * 检查 koot-cli 是否需要升级
 * @async
 * @returns {boolean} 是否需要更新
 */
const checkUpdate = async () => {
    const waiting = spinner('');

    vars.locales = await getLocales();

    const p = await fs.readJson(
        url.fileURLToPath(new URL('../package.json', import.meta.url))
    );
    const v = p.version;
    const latest = await latestVersion('koot-cli');

    let needUpdate = false;

    if (!semver.valid(v)) needUpdate = true;

    if (
        semver.gt(
            semver.valid(semver.coerce(latest)),
            semver.valid(semver.coerce(v))
        )
    )
        needUpdate = true;

    waiting.stop();

    if (needUpdate) {
        spinner(_('koot-cli_updated')).warn();
        console.log('' + _('koot-cli_updated_description'));
        console.log(`  ` + chalk.gray(`> npm i -g koot-cli`));
        console.log(' ');
        console.log('' + _('koot-cli_updated_suggestion'));
        console.log(`  ` + chalk.gray(`> npx koot-cli`));
        console.log(' ');
    }

    return needUpdate;
};

export default checkUpdate;
