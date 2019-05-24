const chalk = require('chalk');

/**
 * 输出欢迎信息
 * @void
 * @param {String} [msg]
 */
const logWelcome = msg => {
    const ascii = `
    ▄█   ▄█▄  ▄██████▄   ▄██████▄      ███
    ███ ▄███▀ ███    ███ ███    ███ ▀█████████▄
    ███▐██▀   ███    ███ ███    ███    ▀███▀▀██
   ▄█████▀    ███    ███ ███    ███     ███   ▀
  ▀▀█████▄    ███    ███ ███    ███     ███
    ███▐██▄   ███    ███ ███    ███     ███
    ███ ▀███▄ ███    ███ ███    ███     ███
    ███   ▀█▀  ▀██████▀   ▀██████▀     ▄████▀
    ▀
    `;

    console.log(chalk.cyanBright(ascii));

    if (msg) {
        // const count = Math.floor(ascii.split('\n')[1].length / 2)
        const count = 20;
        console.log(
            ''.padStart(count, ' ') + chalk.bgCyan(` ${msg} `) + `\n\n`
        );
    } else {
        console.log('\n');
    }
};

module.exports = logWelcome;
