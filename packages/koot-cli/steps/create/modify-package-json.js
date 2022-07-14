require('../../types');

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const latestVersion = require('latest-version');

const _ = require('../../lib/translate');
const spinner = require('../../lib/spinner');

/**
 * 修改摸板文件
 * @async
 * @param {AppInfo} app
 * @returns {Promise<void>}
 */
module.exports = async (app) => {
    const msgModifying = chalk.whiteBright(_('modifying_boilerplate'));
    const waitingDownloading = spinner(msgModifying + '...');
    const { dest } = app;

    // ========================================================================
    //
    // `package.json`
    //
    // ========================================================================
    {
        const packageJsonFile = path.resolve(dest, 'package.json');
        if (!fs.existsSync(packageJsonFile))
            throw new Error('`package.json` not found');

        const packageJson = await fs.readJson(packageJsonFile);
        const extend = {
            version: '1.0.0',
            koot: {},
        };

        if (typeof app.name === 'string') extend.name = app.name;

        if (typeof app.description === 'string' && app.description !== '') {
            extend.description = app.description;
        } else {
            delete packageJson.description;
        }

        if (typeof app.author !== 'undefined') {
            extend.author = app.author;
        } else {
            delete packageJson.author;
        }

        if (app.spaMode === 'electron') {
            extend.devDependencies = {
                ...packageJson.devDependencies,
            };
            extend.devDependencies['koot-electron'] =
                '^' + (await latestVersion('koot-electron'));
        }

        // 确认当前 Koot.js 版本，添加至特定字段
        require('../../lib/modify-package-json/add-koot-version.js')(
            dest,
            packageJson
        );

        await fs.writeJson(
            packageJsonFile,
            {
                ...packageJson,
                ...extend,
            },
            {
                spaces: 4,
            }
        );
    }

    // ========================================================================
    //
    // 结束
    //
    // ========================================================================

    waitingDownloading.stop();
    spinner(msgModifying).finish();
};
