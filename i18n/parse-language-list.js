/**
 * 根据输入的语言列表字符串，返回语言列表array
 * 
 * @param {string} langList 语言列表字符串，eg: zh-CN,zh;q=0.8,en;q=0.6
 * 
 * @returns {array} 语言列表
 */
export default langList =>
    langList
        .split(',')
        .map(value => value.split(';')[0])
