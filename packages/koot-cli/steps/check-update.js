const fs = require('fs-extra');
const path = require('path');
const latestVersion = require('latest-version');
const semver = require('semver');
const chalk = require('chalk');

const vars = require('../lib/vars');
const getLocales = require('../lib/get-locales');
const spinner = require('../lib/spinner');
const _ = require('../lib/translate');

/**
 * 检查 koot-cli 是否需要升级
 * @async
 * @returns {Boolean} 是否需要更新
 */
module.exports = async () => {
    const waiting = spinner('');

    vars.locales = await getLocales();

    const p = await fs.readJson(path.resolve(__dirname, '../package.json'));
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
    }

    return needUpdate;
};
