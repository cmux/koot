const chalk = require('chalk');

const ensureLocales = require('./ensure-locales');
const _ = require('./translate');
const checkIsCMNetwork = require('./check-is-cm-network');

exports.welcome = async () => {
    await ensureLocales();

    /** 当前是否在 CM 内网 */
    const isCMNetwork = await checkIsCMNetwork();

    // 根据是否在 CM 内网输出欢迎信息
    console.log('');
    if (isCMNetwork) console.log(chalk.cyanBright(_('welcomeCM')));
    console.log(chalk.cyanBright(_('welcome')));
    console.log('');
};
