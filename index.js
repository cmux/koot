/**
 * Redux Store
 * @type {Object}
 */
export let store
export const setStore = o => store = o

/**
 * History 对象
 * @type {Object}
 */
export let history
export const setHistory = o => history = o

/**
 * [仅当多语言开启时存在] 当前语种ID
 * @type {String}
 */
export let localeId
export const setLocaleId = o => localeId = o

/**
 * 通用的高阶组件/方法的装饰器
 * @type {Function}
 */
export let extend = () => (WrappedComponent) => WrappedComponent
export const setExtender = o => extend = o

/**
 * 设置页面信息的高阶组件/方法
 * @type {Function}
 */
export let pageinfo = () => (WrappedComponent) => WrappedComponent
export const setPageinfo = o => pageinfo = o
