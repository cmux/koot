const ora = require('ora');

/**
 * 输出命令终止信息
 * @void
 * @param {String} [msg]
 */
const logAbort = msg => {
    ora({
        text: 'Task aborted.'
    }).warn();
    if (msg) console.log('  ' + msg);
    console.log('');
};

module.exports = logAbort;
