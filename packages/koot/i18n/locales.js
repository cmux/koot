/* global __KOOT_SSR__:false, __KOOT_SSR_STATE__:false */

/**
 * 根据当前环境，返回语言包对象的引用
 * - 客户端: 当前语种的语言包对象 (仅当多语言类型为 `redux` 时)
 * - 服务器端: 所有语种语言包合集对象
 * @returns {Object}
 */
const getLocalesObject = () => {
    if (__SERVER__) {
        if (__DEV__ && typeof global.__KOOT_SSR__ === 'object')
            return global.__KOOT_SSR__.locales
        else if (typeof __KOOT_SSR__ === 'object')
            return __KOOT_SSR__.locales
    }
    if (__CLIENT__) {
        if (typeof __KOOT_SSR_STATE__ === 'object') {
            return __KOOT_SSR_STATE__.locales
        }
    }
    return false
}

/**
 * @type {Object}
 * 语言包对象
 * - 客户端: 当前语种的语言包对象 (仅当多语言类型为 `redux` 时)
 * - 服务器端: 所有语种语言包合集对象
 */
export const locales = (() => getLocalesObject() || {})()

export const setLocales = (newLocales = {}) => {
    const obj = getLocalesObject()
    if (obj) Object.assign(obj, newLocales)
    return locales
}

export default locales
