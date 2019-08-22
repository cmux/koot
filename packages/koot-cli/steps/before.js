const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const vars = require('../lib/vars');
const getLocales = require('../lib/get-locales');
const _ = require('../lib/translate');
const checkUpdate = require('./check-update');

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
        path.resolve(__dirname, '../package.json')
    );

    console.log(' ');
    console.log('' + _('current_version') + chalk.cyanBright(version));

    const needUpdate = await checkUpdate();

    return { needUpdate };
};

module.exports = before;
