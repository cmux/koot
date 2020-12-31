const chalk = require('chalk');
const inquirer = require('inquirer');

const spinner = require('../../lib/spinner');
const _ = require('../../lib/translate');
const updateVersionInPackagejson = require('./update-version-in-packagejson');

module.exports = async (cwd = process.cwd(), prevVersion = '0.13.0') => {
    const msgUpgrading = require('./msg-upgrading')(prevVersion, '0.14.0');
    let spinnerUpgrading = spinner(msgUpgrading + '...');
    const filesChanged = ['package.json'];

    await updateVersionInPackagejson(cwd, '0.14.0');

    // 询问是否进行 codemod
    spinnerUpgrading.stop();
    // console.log('  ' + msgUpgrading);
    // spinner(msgUpgrading).finish();
    const { runCodemod } = inquirer.prompt([
        {
            type: 'confirm',
        },
    ]);
    if (runCodemod) {
    }

    // 结束
    spinnerUpgrading = spinner(msgUpgrading + '...');
    spinnerUpgrading.stop();
    spinner(msgUpgrading).finish();

    return {
        warn:
            chalk.yellowBright('koot 0.14.0') +
            chalk.reset(' ') +
            '\n' +
            _('upgrade_0.14.0_warning_1') +
            '\n' +
            _('upgrade_0.14.0_warning_2'),
        files: [...new Set(filesChanged)],
    };
};
