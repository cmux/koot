const chalk = require('chalk');

const spinner = require('../../lib/spinner');
const _ = require('../../lib/translate');
const updateVersionInPackagejson = require('./update-version-in-packagejson');

module.exports = async (cwd = process.cwd(), prevVersion = '0.8.0') => {
    const msgUpgrading = require('./msg-upgrading')(prevVersion, '0.9.0');
    const spinnerUpgrading = spinner(msgUpgrading + '...');
    const filesChanged = ['package.json'];

    // TODO: 添加 config: bundleVersionsKeep = false

    await updateVersionInPackagejson(cwd, '0.9.0');

    // 结束
    spinnerUpgrading.stop();
    spinner(msgUpgrading).finish();

    return {
        warn:
            chalk.yellowBright('koot 0.9.0') +
            chalk.reset(' ') +
            '\n' +
            _('upgrade_0.9.0_warning_1') +
            '\n' +
            _('upgrade_0.9.0_warning_2'),
        files: [...new Set(filesChanged)]
    };
};
