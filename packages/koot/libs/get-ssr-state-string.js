/**
 * 输出 SSR 时需要的 state 字符串形式结果
 * @param {Object} state
 * @returns {string}
 */
const getSSRStateString = (state = {}) =>
    `JSON.parse(` +
    `decodeURIComponent("${encodeURIComponent(JSON.stringify(state))}"))`;

export default getSSRStateString;
