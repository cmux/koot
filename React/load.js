import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

/**
 * @callback funcFetchData
 * @param {Object} state 当前 state
 * @param {Object} renderProps 服务器端渲染时的 props
 * @returns {Object}
 */

/**
 * 负责数据同构的组件装饰器
 * @param {funcGetPageInfo} callback 方法: 获取并返回数据
 * @param {Object} [options={}] 选项
 */

export default (funcGetPageInfo, options = {}) => (WrappedComponent) => {

    class KootLoad extends React.Component {
    }

    return hoistStatics(KootLoad, WrappedComponent)

}
