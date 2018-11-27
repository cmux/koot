const chalk = require('chalk')

/**
 * 生成 log 消息内容
 * @variation 只提供内容
 * @param {String} content 内容
 *//**
* 生成 log 消息内容
* @variation 提供标记和内容
* @param {String|Boolean} [mark=""] 标记
* @param {String} content 内容
*//**
 * 生成 log 消息内容
* @variation 提供标记、类型和内容
* @param {String|Boolean} [mark=""] 标记
* @param {String} [type=""] 操作类型
* @param {String} content 内容
*/
const generateLogMsg = (mark, type, content) => {
    if (typeof mark !== 'undefined' && typeof type === 'undefined' && typeof content === 'undefined')
        return generateLogMsg('', '', mark)
    if (typeof type !== 'undefined' && typeof content === 'undefined')
        return generateLogMsg(mark, '', type)

    let markColor = 'cyan'
    if (mark === false) mark = ''
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
        case 'cb':
        case 'callback': {
            mark = '⚑ '
            markColor = 'cyan'
            break
        }
        case 'warning': {
            mark = '! '
            markColor = 'yellowBright'
            break
        }
        case '': {
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

    return (mark === '' ? '' : chalk[markColor](mark))
        + chalk[typeColor](`[koot${type ? `/${type}` : ''}] `)
        + content
}

module.exports = generateLogMsg
