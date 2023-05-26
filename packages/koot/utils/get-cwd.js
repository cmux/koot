/**
 * 获取运行目录
 * @returns {String}
 */
const getCwd = () => {
    // console.log('process.env.KOOT_CWD', process.env.KOOT_CWD)
    // console.log('process.cwd()', process.cwd())
    return typeof process.env.KOOT_CWD === 'string'
        ? process.env.KOOT_CWD
        : process.cwd();
};

export default getCwd;
