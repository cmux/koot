/**
 * 将 RGB 转换为 HEX (开头有 #)
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
module.exports = (r, g, b) =>
    '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
