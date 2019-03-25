//文档查看：https://github.com/mzabriskie/axios
import axios from 'axios';

export default axios;

const ERROR_MSG = {
    /* 网络类异常 */
    0: '请求未发出',
    401: '你还未登录',
    403: '你没有权限访问该页面',
    413: '上传文件太大',

    404: '接口不存在',
    500: '服务器错误',
};

function dataSerializer(data) {
    var key,
        result = [];

    if (typeof data === 'string') {
        return data;
    }

    for (key in data) {
        if (data.hasOwnProperty(key)) {
            result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
    }
    return result.join('&');
}

axios.interceptors.request.use(config => {
    if (!config.timeout) {
        config.timeout = 60 * 1000;
    }

    config.url += (/\?/.test(config.url) ? '&' : '?') + '_s=' + Date.now();

    if (!config.useJson && (config.method == 'post' || config.method == 'put')) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.transformRequest = dataSerializer;
    }

    return config;
});

axios.interceptors.response.use(
    response => {
        let data = response.data;

        if (data && typeof data == 'object') {
            if (data.is_succ === false) {
                return createError(data.error_msg, data.error_code, response.config, response);
            }

            return data;
        }

        return response;
    },
    respError => {
        const response = respError.response || {};
        let error_msg, error_code;

        //请求超时
        if (respError.code === 'ECONNABORTED') {
            error_code = 504;
            error_msg = '网络请求超时（' + respError.config.timeout + 'ms），请确认网络正常并重试';
        } else {
            error_code = response.status || -1;
            error_msg = response.statusText || respError.message;
        }

        return createError(error_msg, error_code, respError.config, response);
    }
);

/**
 * @description 返回一个以包装后的error对象为拒绝原因的promise
 * @param {string} error_msg 错误描述。如果 error_code 有匹配预定的错误描述，则优先显示预定义错误描述
 * @param {string} error_code 错误码。错误描述码，来自接口返回或者httpcode
 *
 * @return {promise}
 */
function createError(error_msg, error_code = -1, config, response) {
    const error = new Error(ERROR_MSG[error_code] || error_msg || '网络异常（' + error_code + '）');
    error.error_code = error_code;

    error.config = config;
    error.response = response;

    return Promise.reject(error);
}
