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
module.exports = (...args) => {
    console.log(require('./get-log-msg')(...args))
}
