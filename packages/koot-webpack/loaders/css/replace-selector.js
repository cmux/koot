/**
 * 替换 CSS 选择器 (selector)
 * @param {String} selector 
 * @param {String} md5Name
 * @param {String} [className=component] 
 * @returns {String}
 */
const replaceSelector = (selector, md5Name, className = 'component') => {
    // return selector.replace(/.component/g, '.' + md5Name)
    const regex = new RegExp(`(\\W*)\\.${className}`, 'g')
    return selector.replace(regex, (match, combinator) => {
        // console.log(combinator)
        if (!combinator) {
            if (match === `.${className}`)
                return `.${md5Name}`
            return match
        }

        const theCombinator = combinator.trim()
        // 连接器为空格时或者 `>`
        if (!theCombinator || theCombinator === '>') {
            return match
        }
        switch (theCombinator) {
            // 非连接器情况
            case '="':
            case `='`: {
                return match
            }
            // 连接器为其他情况时 (如 ~, +, >)
            default:
                return `${combinator}.${md5Name}`
        }
    })
}

module.exports = replaceSelector
