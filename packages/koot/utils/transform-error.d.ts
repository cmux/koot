/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 转换 Error 对象
 * @returns {Error} 确定会有 `message` 和 `msg` 属性的 Error 对象
 */
function transformError(error: Error | Record<string, any> | string): Error;

export default transformError;
