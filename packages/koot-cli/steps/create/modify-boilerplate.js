require('../../types');

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const semver = require('semver');

const _ = require('../../lib/translate');
const spinner = require('../../lib/spinner');

/**
 * 修改摸板文件
 * @async
 * @param {AppInfo} app
 * @returns {Promise<void>}
 */
module.exports = async app => {
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
            koot: {}
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

        // 确认当前 Koot.js 版本，添加至特定字段
        {
            let kootBaseVersion;
            // 先判断已安装的 koot 依赖的版本
            if (
                fs.existsSync(path.resolve(dest, 'node_modules')) &&
                fs.existsSync(path.resolve(dest, 'node_modules/koot')) &&
                fs.existsSync(
                    path.resolve(dest, 'node_modules/koot/package.json')
                )
            ) {
                const { version } = await fs.readJson(
                    path.resolve(dest, 'node_modules/koot/package.json')
                );
                kootBaseVersion = version;
            } else {
                // 如果没有安装 koot，采用当前依赖的版本
                const {
                    dependencies = {},
                    devDependencies = {},
                    optionalDependencies = {}
                } = packageJson;
                kootBaseVersion =
                    optionalDependencies.koot ||
                    devDependencies.koot ||
                    dependencies.koot;
            }
            if (!kootBaseVersion) throw new Error('version invalid');
            extend.koot.baseVersion = semver.coerce(kootBaseVersion).version;
        }

        await fs.writeJson(
            packageJsonFile,
            {
                ...packageJson,
                ...extend
            },
            {
                spaces: 4
            }
        );
    }

    // ========================================================================
    //
    // `koot.config.js`
    //
    // ========================================================================
    {
        const properties = [
            ['name', 'name'],
            ['type', 'type']
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
