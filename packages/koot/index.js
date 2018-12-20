/* global
    Store:false,
    History:false,
    LocaleId:false,
*/

/**
 * 手动创建 Redux Store 时需要的相关对象
 * @type {Object}
 */
import * as reduxForCreateStore from './React/redux'
export { reduxForCreateStore }

/**
 * 通用的高阶组件/方法的装饰器
 * @type {Function}
 */
export { default as extend } from "__KOOT_HOC_EXTEND__"

/**
 * 设置页面信息的高阶组件/方法
 * @type {Function}
 */
export { default as pageinfo } from "__KOOT_HOC_PAGEINFO__"

// 其他全局变量
export const localeId = (() => {
    if (__CLIENT__)
        return window.LocaleId || ''
    if (__SERVER__) {
        if (typeof LocaleId === 'undefined')
            return ''
        return LocaleId || ''
    }
})()
export const store = (() => {
    if (__CLIENT__)
        return window.Store
    if (__SERVER__) {
        if (typeof Store === 'undefined')
            return ''
        return Store
    }
})()
export const history = (() => {
    if (__CLIENT__)
        return window.History
    if (__SERVER__) {
        if (typeof History === 'undefined')
            return ''
        return History
    }
})()
