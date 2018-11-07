/**
 * 等待指定时间
 * @param {Number} ms 等待时间
 */
module.exports = (ms = 1) => new Promise(resolve =>
    setTimeout(resolve, ms)
)
