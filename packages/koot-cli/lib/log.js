/* eslint-disable no-console */

import chalk from 'chalk';

import ensureLocales from './ensure-locales.js';
import _ from './translate.js';
import checkIsCMNetwork from './check-is-cm-network.js';

export const welcome = async () => {
    await ensureLocales();

    /** 当前是否在 CM 内网 */
    const isCMNetwork = await checkIsCMNetwork();

    // 根据是否在 CM 内网输出欢迎信息
    console.log('');
    if (isCMNetwork) console.log(chalk.cyanBright(_('welcomeCM')));
    console.log(chalk.cyanBright(_('welcome')));
    console.log('');
};
