const fs = require('fs-extra')
const sleep = require('../utils/sleep')

const defaultPlaceholder = require('../defaults/content-waiting')

/**
 * 检查文件内容是否已更新（条件：和 placeholder 字符不同）
 * @async
 * @param {String} pathname 
 * @param {String} [contentPlaceholder] 
 * @returns {Promise}
 */
module.exports = async (pathname, contentPlaceholder = defaultPlaceholder) =>
    await new Promise(resolve => {
        const waiting = () => setTimeout(async () => {
            if (!fs.existsSync(pathname))
                return waiting()
            const content = await fs.readFile(pathname, 'utf-8')
            if (!content || content === contentPlaceholder)
                return waiting()
            await sleep(100)
            resolve(content)
        }, 500)
        waiting()
    })
