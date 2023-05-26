/** 判断是否是通过 koot-start 命令启动
 * @returns {Boolean}
 */
const isFromStartCommand = () =>
    process.env.KOOT_COMMAND_START &&
    JSON.parse(process.env.KOOT_COMMAND_START);

export default isFromStartCommand;
