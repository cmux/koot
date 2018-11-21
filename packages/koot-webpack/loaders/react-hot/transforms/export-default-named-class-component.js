/**
 * 匹配情况: 默认输出非匿名 class 组件
 * @param {String} source
 * @return {String}
 */
module.exports = (source) => {
    let className

    // 检查是否是默认输出，并拿到默认输出的变量名
    // export default (*)
    const regexForExportClassName = /^\s*export\s+default\s+([^\s]+)\s*/m
    const matchForClassName = source.match(regexForExportClassName)
    if (Array.isArray(matchForClassName) && typeof matchForClassName[1] === 'string') {
        className = matchForClassName[1]
    } else {
        return source
    }

    // 根据拿到的变量名，查找是否是 class，如果是，在定义 class 之前添加 @hot
    try {
        // console.log(className)
        const regexForClass = new RegExp(`^\\s*class\\s+${className}\\s+extends`, 'm')
        if (regexForClass.test(source)) {
            source = source.replace(regexForClass, `@hot(module)\nclass ${className} extends`)
        }
    } catch (e) {
        return source
    }

    return source
}
