/**
 * 匹配情况: 直接输出带高阶组件的匿名的函数/静态组件
 * @param {String} source
 * @return {String}
 */
module.exports = (source) => {
    const regex = /^\s*export\s+default\s+[a-zA-Z0-9_]+\(\{[\s\S]+\}\s*\)\s*\([\s\S]+\)/m
    if (regex.test(source)) {
        source = source.replace(/\}\s*\)\s*\(([\s\S]+)\)/m, '})(hot(module)($1))')
    }
    return source
}
