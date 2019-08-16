/**
 * 转换所有属性中的 `url()` 和 `image-set()` 的引用地址
 * @param {Root} root PostCSS 根对象
 * @param {FunctionTransformer} transformer 转换函数
 * @return {Root}
 */
/**
 * 转换函数
 * @callback FunctionTransformer
 * @param {string} url 原始 URL 字符串
 * @returns {string} 结果字符串
 */
const postcssTransformDeclUrls = (root, transformer) => {
    if (typeof root !== 'object') throw new Error('Missing parameter: `root`');
    if (!root.toResult) throw new Error('Invalid parameter: `transformer`');
    if (typeof transformer !== 'function')
        throw new Error('Missing or invalid parameter: `transformer`');

    /** 处理所有属性中的 `url()` 和 `image-set()` 的引用地址 */
    const regExpURL = /url\([ '"]*(.+?)[ '"]*\)/g;
    const regExpImageSet = /(\s|^)image-set\((.+?)\)/g;
    root.walkDecls(decl => {
        decl.value = decl.value.replace(
            regExpURL,
            // (...args) => `url("' + require('${args[1]}') + '")`
            (...args) => `url("${transformer(args[1])}")`
        );

        const matchesImageSet = regExpImageSet.exec(decl.value);
        if (Array.isArray(matchesImageSet) && matchesImageSet.length > 2) {
            decl.value = matchesImageSet[2]
                .split(',')
                .map(value =>
                    value.trim().replace(
                        /['"](.+?)['"]/g,
                        // (...args) => `"' + require('${args[1]}') + '"`
                        (...args) => `"${transformer(args[1])}"`
                    )
                )
                .join(', ');
        }

        // console.log(' ');
        // console.log(decl.value);
    });

    return root;
};

module.exports = postcssTransformDeclUrls;
