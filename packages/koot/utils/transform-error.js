/**
 * 转换 Error 对象
 * @param {Error|string} error
 * @returns {Error} 确定会有 `message` 和 `msg` 属性的 Error 对象
 */
function transformError(error) {
    const isValid = (t) =>
        typeof t !== 'boolean' && (t === '' || t === 0 || !!t);

    let msg =
        typeof error === 'object' && isValid(error.message)
            ? error.message
            : typeof error === 'object' && isValid(error.msg)
            ? error.msg
            : typeof error === 'string'
            ? error
            : '网络异常，请稍后重试';

    // let msg =
    //     error?.message ??
    //     error?.msg ??
    //     (typeof error === 'string' ? error : '网络异常，请稍后重试');

    if (msg === 'Network Error') msg = '网络异常，请稍后重试';

    if (error instanceof Error) {
        // error = err;
    } else if (typeof error === 'object') {
        error = new Error(msg);
        for (const [key, value] of Object.entries(error)) error[key] = value;
    } else {
        error = new Error(error);
    }

    error.message = msg;
    error.msg = msg;

    return error;
}

module.exports = transformError;
