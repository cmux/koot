import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

import '../../types.js';

import _ from '../../lib/translate.js';
import spinner from '../../lib/spinner.js';

/**
 * 修改摸板文件
 * @async
 * @param {AppInfo} app
 * @returns {Promise<void>}
 */
const modifyBoilerplate = async (app) => {
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
        const kootConfig = await import(kootConfigFile);
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

export default modifyBoilerplate;
