require('../../types');

const chalk = require('chalk');

const _ = require('../../lib/translate');
const spinner = require('../../lib/spinner');
const spawn = require('../../lib/spawn');

// ============================================================================

const cmd = {
    yarn: 'yarn',
    npm: 'npm install'
};

// ============================================================================

/**
 * 安装依赖
 * @async
 * @param {AppInfo} app
 * @returns {Promise<void>}
 */
module.exports = async app => {
    const msgInstalling = chalk.whiteBright(_('installing_dependencies'));
    const waitingDownloading = spinner(msgInstalling + '...');
    const { dest, packageManager } = app;

    await spawn(cmd[packageManager], {
        cwd: dest,
        stdio: 'ignore'
    });

    waitingDownloading.stop();
    spinner(msgInstalling).finish();
};
