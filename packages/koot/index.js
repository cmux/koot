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
