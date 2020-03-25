const path = require('path');

/**
 * 转换所有属性中的 `url()` 和 `image-set()` 的引用地址
 * @param {Root} root PostCSS 根对象
 * @param {Object} options 转换方式
 * @param {FunctionTransformer} [options.transformer] 转换函数
 * @param {string} [options.context] 当前目录，用以转换相对路径为绝对路径
 * @return {Root}
 */
/**
 * 转换函数
 * @callback FunctionTransformer
 * @param {string} url 原始 URL 字符串
 * @returns {string} 结果字符串
 */
const postcssTransformDeclUrls = (root, options = {}) => {
    if (typeof root !== 'object') throw new Error('Missing parameter: `root`');
    if (!root.toResult) throw new Error('Invalid parameter: `transformer`');

    const {
        transformer,
        context
        // prefixToRemove
    } = options;

    // 处理所有属性中的 `url()` 和 `image-set()` 的引用地址

    const regExpURL = /url\([ '"]*(.+?)[ '"]*\)/g;
    const regExpImageSet = /(\s|^)image-set\((.+?)\)/g;
    /** 转换 URL 字符串 */
    const transformUrl = url => {
        if (typeof context === 'string' && /^[.]{1,2}[\\/]/.test(url)) {
            url = path.resolve(context, url).replace(/[\\]{1}/g, '\\\\');
        }
        if (typeof transformer === 'function') return transformer(url);
        return url;
    };
    root.walkDecls(decl => {
        decl.value = decl.value.replace(
            regExpURL,
            // (...args) => `url("' + require('${args[1]}') + '")`
            (...args) => `url("${transformUrl(args[1])}")`
        );

        const matchesImageSet = regExpImageSet.exec(decl.value);
        if (Array.isArray(matchesImageSet) && matchesImageSet.length > 2) {
            decl.value = matchesImageSet[2]
                .split(',')
                .map(value =>
                    value.trim().replace(
                        /['"](.+?)['"]/g,
                        // (...args) => `"' + require('${args[1]}') + '"`
                        (...args) => `"${transformUrl(args[1])}"`
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
