/**
 * 检查当前环境是否为测试模式
 * @returns {Boolean}
 */
module.exports = () =>
    global.kootTest || (process.env.KOOT_TEST_MODE && JSON.parse(process.env.KOOT_TEST_MODE))
