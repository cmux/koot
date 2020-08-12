const fs = require('fs-extra');
const sleep = require('../utils/sleep');

const defaultPlaceholder = require('../defaults/content-waiting');

/**
 * 检查文件内容是否已更新（条件：和 placeholder 字符不同）
 * @async
 * @param {string} file
 * @param {string|Function} [check]
 *                          - 如果是字符串且等于文件内容，表示需要等待。
 *                          - 如果是函数，返回 true 表示可以继续，返回 false 表示需要等待
 * @returns {Promise<string>}
 */
module.exports = async (file, check = defaultPlaceholder) =>
    await new Promise((resolve) => {
        const waiting = () =>
            setTimeout(async () => {
                if (!fs.existsSync(file)) return waiting();
                const content = await fs.readFile(file, 'utf-8');

                if (!content) return waiting();
                if (typeof check === 'string' && content === check)
                    return waiting();
                if (typeof check === 'function' && !(await check(content)))
                    return waiting();

                await sleep(100);
                resolve(content);
            }, 500);
        waiting();
    });
