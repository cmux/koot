const chalk = require('chalk');

/**
 * 输出即将运行命令的信息
 * @void
 * @param {String} script
 */
const logRunScript = script => {
    if (!script) return;

    console.log(chalk.cyanBright('…') + chalk.reset(' ') + 'Running script');
    console.log('  ' + script + '\n');
};

module.exports = logRunScript;
