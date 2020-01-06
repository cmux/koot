/**
 * 返回结果对象
 * @typedef {Object} ReturnedCSS
 * @property {string} text
 * @property {CSSRuleList} rules
 */

/**
 * @typedef {Object} Result
 * @property {ReturnedCSS} _global
 * @property {ReturnedCSS} [moduleId]
 */

/**
 * _[仅客户端]_
 * 获取当前全局 CSS 和所有组件 CSS
 * @returns {Result}
 */
export default () => {
    if (!__CLIENT__) return {};
    if (typeof document.styleSheets !== 'object')
        throw new Error(`document.styleSheets not supported!`);
    const results = {};
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const owner = sheet.ownerNode;
        if (!owner) continue;
        if (owner.getAttribute(__STYLE_TAG_GLOBAL_ATTR_NAME__) === '')
            results._global = transformCSSStyleSheet(sheet);
        if (owner.getAttribute(__STYLE_TAG_MODULE_ATTR_NAME__))
            results[
                owner.getAttribute(__STYLE_TAG_MODULE_ATTR_NAME__)
            ] = transformCSSStyleSheet(sheet);
    }
    return results;
};

const transformCSSStyleSheet = sheet => {
    const rules = sheet.cssRules || sheet.rules;
    if (typeof rules !== 'object' || !rules.length) return {};
    return {
        text: [...rules].map(rule => rule.cssText || '').join('\r\n'),
        rules
    };
};
