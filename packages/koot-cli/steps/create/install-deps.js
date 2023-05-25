import chalk from 'chalk';

import '../../types/index.js';

import _ from '../../lib/translate.js';
import spinner from '../../lib/spinner.js';
import spawn from '../../lib/spawn.js';

// ============================================================================

const cmd = {
    yarn: 'yarn',
    npm: 'npm install',
};

// ============================================================================

/**
 * 安装依赖
 * @async
 * @param {AppInfo} app
 * @returns {Promise<void>}
 */
const installDeps = async (app) => {
    const msgInstalling = chalk.whiteBright(_('installing_dependencies'));
    const waitingDownloading = spinner(msgInstalling + '...');
    const { dest, packageManager } = app;

    await spawn(cmd[packageManager], {
        cwd: dest,
        stdio: 'ignore',
    });

    waitingDownloading.stop();
    spinner(msgInstalling).finish();
};

export default installDeps;
