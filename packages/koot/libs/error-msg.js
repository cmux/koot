/**
 * 生成错误信息
 * @param {String} msg
 * @returns {String}
 */
const errorMsg = (type, msg) => {
    if (typeof type === 'string' && typeof msg === 'string')
        return `${type}::${msg}`
    return type
}

module.exports = errorMsg
