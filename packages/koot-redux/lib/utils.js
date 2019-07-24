/**
 * 判断数据是否为对象类型
 *
 * @param  {[type]} _data [description]
 * @return {[type]}       [description]
 */
export const isObject = data => {
    return Object.prototype.toString.call(data) === '[object Object]';
};

/**
 * 判断数据是否为字符串类型
 *
 * @param  {[type]} _data [description]
 * @return {[type]}       [description]
 */
export const isString = data => {
    return Object.prototype.toString.call(data) === '[object String]';
};

/**
 * 判断数据是否为function
 *
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const isFunction = data => {
    return Object.prototype.toString.call(data) === '[object Function]';
};
