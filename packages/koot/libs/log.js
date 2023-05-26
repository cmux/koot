/* eslint-disable no-console */

import getLogMsg from './get-log-msg.js';

/**
 * 命令行 Log
 * @variation 1
 * @param {String} content 内容
 */ /**
 * 命令行 Log
 * @variation 2
 * @param {String} [type=""] 操作类型
 * @param {String} content 内容
 */ /**
 * 命令行 Log
 * @variation 3
 * @param {String} [mark=""] 标记
 * @param {String} [type=""] 操作类型
 * @param {String} content 内容
 */
const log = (...args) => {
    console.log(getLogMsg(...args));
};

export default log;
