/**
 * 替换 CSS 选择器 (selector)
 * @param {String} selector
 * @param {String} md5Name
 * @param {String} [className=component]
 * @returns {String}
 */
const replaceSelector = (selector, md5Name, className = 'component') => {
    // return selector.replace(/.component/g, '.' + md5Name)
    const regex = new RegExp(`(\\W*)\\.${className}([A-Za-z0-9_-]*)`, 'g');
    const matchCount = selector.match(regex).length;
    let index = 0;
    return selector.replace(regex, (match, combinator, suffix) => {
        index++;

        // console.log(combinator)
        if (!combinator) {
            if (match === `.${className}${suffix}`)
                return `.${md5Name}${suffix}`;
            return match;
        }

        // console.log({ selector, match, index, matchCount, combinator })
        // console.log({ match, combinator, suffix })

        const theCombinator = combinator.trim();
        /**
         * 最后一个 .component 不进行转换的条件
         * - 连接器为选择子元素：空格时或者 `>`
         * - .component 出现多次
         * - 非第一个
         * - 没有后缀
         */
        if (
            matchCount > 1 &&
            index > 1 &&
            !suffix &&
            (!theCombinator || theCombinator === '>')
        ) {
            return match;
        }
        switch (theCombinator) {
            // 非连接器情况
            case '="':
            case `='`: {
                return match;
            }
            // 连接器为其他情况时 (如 ~, +, >)
            default:
                return `${combinator}.${md5Name}${suffix}`;
        }
    });
};

export default replaceSelector;
