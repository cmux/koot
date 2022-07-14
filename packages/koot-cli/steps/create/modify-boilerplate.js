require('../../types');

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

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
    // `koot.config.js`
    //
    // ========================================================================
    {
        const properties = [
            ['name', 'name'],
            ['type', 'type'],
        ];
        const kootConfigFile = path.resolve(dest, 'koot.config.js');
        const kootConfig = require(kootConfigFile);
        let content = await fs.readFile(kootConfigFile, 'utf-8');

        for (const [optionKey, appProp] of properties) {
            const originalValue = kootConfig[optionKey];
            const newValue = app[appProp];
            const regex = new RegExp(
                `([ ]*)${optionKey}:([ ]*)(['"])${originalValue}(['"])`,
                'gm'
            );
            content = content.replace(
                regex,
                `$1${optionKey}:$2$3${newValue}$4`
            );
        }

        // 添加 serverless
        if (app.serverMode === 'serverless') {
            content = content.replace(
                /\n(\s*)\/[*]+\n(\s*)\* 路由 & 客户端历史记录/gm,
                (str, $1) => `${$1}target: 'serverless',` + str
            );
        }

        // 添加 electron
        if (app.spaMode === 'electron') {
            content = content.replace(
                /\n(\s*)\/[*]+\n(\s*)\* 路由 & 客户端历史记录/gm,
                (str, $1) => `${$1}target: 'electron',` + str
            );
        }

        await fs.writeFile(kootConfigFile, content, 'utf-8');
    }

    // ========================================================================
    //
    // 结束
    //
    // ========================================================================

    waitingDownloading.stop();
    spinner(msgModifying).finish();
};
