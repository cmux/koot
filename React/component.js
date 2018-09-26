// TODO: All-in-one decorator for react component
// https://github.com/cmux/koot/issues/8

import React from 'react'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'
import hoistStatics from 'hoist-non-react-statics'
import { ImportStyle } from 'sp-css-import'

import { store } from '../index.js'

/**
 * 获取数据
 * @callback callbackFetchData
 * @param {Object} state 当前 state
 * @param {Object} renderProps 封装的同构 props
 * @param {Function} dispatch Redux dispatch
 * @returns {Promise}
 */

/**
 * 判断数据是否准备好
 * @callback callbackCheckLoaded
 * @param {Object} state 当前 state
 * @param {Object} renderProps 封装的同构 props
 * @returns {Boolean}
 */

/**
 * 获取页面信息
 * @callback callbackGetPageInfo
 * @param {Object} state 当前 state
 * @param {Object} renderProps 封装的同构 props
 * @returns {Object}
 */

/**
 * 通用组件装饰器/高阶组件
 * @param {Object} options 选项
 * @param {Boolean|Function} [options.connect] react-redux 的 connect() 的参数。如果为 true，表示使用 connect()，但不连接任何数据
 * @param {callbackGetPageInfo} [options.pageinfo]
 * @param {Object} [options.data] 同构数据相关
 * @param {callbackFetchData} [options.data.fetch]
 * @param {callbackCheckLoaded} [options.data.check]
 * @param {String} [options.styles] 组件 CSS 结果
 * @param {Boolean} [options.hot=true] （仅针对开发模式）是否允许热加载/热更新
 * @returns {Function} 封装好的 React 组件
 */
export default (options = {}) => (WrappedComponent) => {
}
