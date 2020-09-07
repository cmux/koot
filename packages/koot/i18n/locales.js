const { SSRSTATE } = require('../defaults/defines-window');
const { get: getSSRContext } = require('../libs/ssr/context');

const __devLocales = {};

/**
 * 根据当前环境，返回语言包对象的引用
 * - 客户端: 当前语种的语言包对象 (仅当多语言类型为 `store` 时)
 * - 服务器端: 所有语种语言包合集对象
 * @returns {Object}
 */
export const getLocalesObject = () => {
    if (__SERVER__) {
        if (__DEV__) {
            return __devLocales;
        } else return getSSRContext().locales || false;
    }
    if (__CLIENT__) {
        if (typeof window[SSRSTATE] === 'object') {
            return window[SSRSTATE].locales;
        }
    }
    return false;
};

/**
 * @type {Object}
 * 语言包对象
 * - 客户端: 当前语种的语言包对象 (仅当多语言类型为 `store` 时)
 * - 服务器端: 所有语种语言包合集对象
 */
export let locales = (() => getLocalesObject() || {})();

export const setLocales = (newLocales = {}) => {
    // const obj = getLocalesObject()
    if (locales) Object.assign(locales, newLocales);
    else locales = newLocales;
    return locales;
};

export default locales;
