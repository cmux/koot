const chalk = require('chalk')

/**
 * 命令行 Log
 * @variation 1
 * @param {String} content 内容
 *//**
* 命令行 Log
* @variation 2
* @param {String} [type=""] 操作类型
* @param {String} content 内容
*//**
* 命令行 Log
* @variation 3
* @param {String} [mark=""] 标记
* @param {String} [type=""] 操作类型
* @param {String} content 内容
*/
const log = (mark, type, content) => {
    if (typeof mark !== 'undefined' && typeof type === 'undefined' && typeof content === 'undefined')
        return log('', '', mark)
    if (typeof type !== 'undefined' && typeof content === 'undefined')
        return log(mark, '', type)

    let markColor = 'cyan'
    switch (mark.toLowerCase()) {
        case '×':
        case 'x':
        case 'x ':
        case 'error': {
            mark = '× '
            markColor = 'redBright'
            break
        }
        case 'success': {
            mark = '√ '
            markColor = 'green'
            break
        }
        default: {
            mark = '  '
        }
    }

    const typeColor = (() => {
        switch (type) {
            default: return 'yellowBright'
        }
    })()

    console.log(
        chalk[markColor](mark)
        + chalk[typeColor](`[koot${type ? `/${type}` : ''}] `)
        + content
    )
}

module.exports = log
