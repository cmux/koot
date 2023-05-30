/**
 * 获取客户端打包结果 public 目录名
 * @returns {String}
 */
const getDirDistPublicFoldername = () =>
    process.env.WEBPACK_BUILD_TYPE === 'spa' ? '' : `public`;
export default getDirDistPublicFoldername;
