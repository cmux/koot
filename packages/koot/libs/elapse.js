/**
 * 返回易于阅读的时间
 * @param {Number} ms 毫秒值
 * @returns {String}
 */
const elapse = (ms) => {
    if (ms > 1000) return Math.round(ms / 10) / 100 + 's';
    return ms + 'ms';
};

export default elapse;
