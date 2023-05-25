import chalk from 'chalk';

import spinner from '../../lib/spinner.js';
import _ from '../../lib/translate.js';
import updateVersionInPackagejson from './update-version-in-packagejson.js';
import msgUpgrading from './msg-upgrading';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (cwd = process.cwd(), prevVersion = '0.8.0') => {
    const waitMsgUpgrading = msgUpgrading(prevVersion, '0.9.0');
    const spinnerUpgrading = spinner(waitMsgUpgrading + '...');
    const filesChanged = ['package.json'];

    await updateVersionInPackagejson(cwd, '0.9.0');

    // 结束
    spinnerUpgrading.stop();
    spinner(waitMsgUpgrading).finish();

    return {
        warn:
            chalk.yellowBright('koot 0.9.0') +
            chalk.reset(' ') +
            '\n' +
            _('upgrade_0.9.0_warning_1') +
            '\n' +
            _('upgrade_0.9.0_warning_2'),
        files: [...new Set(filesChanged)],
    };
};
