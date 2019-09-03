export const typeOf = data => {
    return Object.prototype.toString.call(data);
};
/**
 * 判断数据是否为对象类型
 *
 * @param  {[type]} _data [description]
 * @return {[type]}       [description]
 */
export const isObject = data => {
    return typeOf(data) === '[object Object]';
};

/**
 * 判断数据是否为字符串类型
 *
 * @param  {[type]} _data [description]
 * @return {[type]}       [description]
 */
export const isString = data => {
    return typeOf(data) === '[object String]';
};

/**
 * 判断数据是否为function
 *
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const isFunction = data => {
    return typeOf(data) === '[object Function]';
};

/**
 * [getDataByPath description]
 * @param  {[type]} obj  [description]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
export function getDataByPath(obj, path) {
    let result = Object.assign({}, obj);
    for (let index = 0; index < path.length; index++) {
        const p = path[index];
        result = result[p];
        if (!result) {
            return result;
        }
    }
    return result;
}

/**
 * [setDataByPath description]
 * @param {[type]} obj   [description]
 * @param {[type]} path  [description]
 * @param {[type]} value [description]
 */
export function setDataByPath(obj, path, value) {
    let result = Object.assign({}, obj);
    let reference = result;
    for (let index = 0; index < path.length; index++) {
        const p = path[index];
        if (index === path.length - 1) {
            reference[p] = value;
        } else {
            reference = reference[p];
        }
        if (!reference) {
            return undefined;
        }
    }
    return result;
}
