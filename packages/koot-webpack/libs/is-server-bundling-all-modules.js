/**
 * 检查当前环境服务器打包结果是否需要打入 module
 */
module.exports = ({ serverPackAll } = {}) => serverPackAll === true;
