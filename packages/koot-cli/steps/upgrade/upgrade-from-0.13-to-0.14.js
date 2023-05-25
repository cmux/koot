// import chalk from 'chalk';
import inquirer from 'inquirer';

import spinner from '../../lib/spinner.js';
// import _ from '../../lib/translate.js';
import updateVersionInPackagejson from './update-version-in-packagejson.js';
import msgUpgrading from './msg-upgrading';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (cwd = process.cwd(), prevVersion = '0.13.0') => {
    const waitMsgUpgrading = msgUpgrading(prevVersion, '0.14.0');
    let spinnerUpgrading = spinner(waitMsgUpgrading + '...');
    const filesChanged = ['package.json'];

    await updateVersionInPackagejson(cwd, '0.14.0');

    // 询问是否进行 codemod
    spinnerUpgrading.stop();
    // console.log('  ' + waitMsgUpgrading);
    // spinner(waitMsgUpgrading).finish();
    const { runCodemod } = inquirer.prompt([
        {
            type: 'confirm',
        },
    ]);
    if (runCodemod) {
    }

    // 结束
    spinnerUpgrading = spinner(waitMsgUpgrading + '...');
    spinnerUpgrading.stop();
    spinner(waitMsgUpgrading).finish();

    return {
        warn: '',
        files: [...new Set(filesChanged)],
    };
};
