/**
 * 获取运行目录
 * @returns {String}
 */
module.exports = () => typeof process.env.KOOT_CWD === 'string'
    ? process.env.KOOT_CWD
    : process.cwd()
