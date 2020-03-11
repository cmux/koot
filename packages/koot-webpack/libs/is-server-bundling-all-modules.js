/**
 * 检查当前环境服务器打包结果是否需要打入 module
 */
module.exports = () =>
    Boolean(
        process.env.WEBPACK_BUILD_ENV !== 'dev' &&
            process.env.WEBPACK_BUILD_TYPE !== 'spa'
    );
