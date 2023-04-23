/* eslint-disable no-console */

import ora from 'ora';

/**
 * 输出完成信息
 * @void
 * @param {String} [msg]
 */
const logFinish = (msg) => {
    console.log('');
    ora({
        text: 'Task finished!',
    }).succeed();
    if (msg) console.log('  ' + msg);
    console.log('');
};

export default logFinish;
