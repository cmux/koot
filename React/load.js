import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import { store } from '../index.js'

/**
 * 获取数据
 * @callback funcFetchData
 * @param {Object} state 当前 state
 * @param {Object} renderProps 服务器端渲染时的 props
 * @param {Function} dispatch Redux dispatch 方法
 * @returns {Promise}
 */

/**
 * 判断数据是否准备好
 * @callback callbackCheckLoaded
 * @param {Object} state 当前 state
 * @param {Object} ownProps 当前组件的 props 对象
 * @returns {Boolean}
 */

/**
 * 数据载入时渲染的内容
 * @callback callbackLoader
 * @param {Object} state 当前 state
 * @param {Object} ownProps 当前组件的 props 对象
 * @returns {String}
 */

/**
 * 负责数据同构的组件装饰器
 * @param {funcFetchData} callback 方法: 获取数据，需要返回 Promise。如果提供了 checkLoaded() 方法，组件中会获得 props.loaded 属性，表示数据是否读取完毕
 * @param {Object} [options={}] 选项
 * @param {callbackCheckLoaded} [options.checkLoaded] 方法：判断数据是否准备好。需要返回 Boolean
 * @param {callbackLoader|String} [options.loader] 数据载入时渲染的内容。如果提供，在载入数据时会渲染该内容。
 */

export default (funcFetchData, options = {}) => (WrappedComponent) => {

    const {
        checkLoaded,
        loader
    } = options

    class KootLoad extends React.Component {
        // mounted = false

        state = {
            loaded: typeof checkLoaded === 'function'
                ? checkLoaded(store.getState(), this.props, store.dispatch)
                : undefined,
        }

        static onServerRenderStoreExtend({ store, renderProps }) {
            if (typeof funcFetchData !== 'function')
                return new Promise(resolve => resolve())
            console.log('onServerRenderStoreExtend')
            return funcFetchData(store.getState(), renderProps, store.dispatch)
        }

        componentDidMount() {
            this.mounted = true

            if (!this.state.loaded) {
                console.log('componentDidMount')
                funcFetchData(store.getState(), this.props, store.dispatch)
                    .then(() => {
                        if (!this.mounted) return
                        this.setState({
                            loaded: true,
                        })
                    })
            }
        }

        componentWillUnmount() {
            this.mounted = false
        }

        render = () => {
            if (!this.state.loaded && typeof loader !== 'undefined') {
                if (typeof loader === 'function')
                    return loader(store.getState(), this.props)
                return loader
            }

            return <WrappedComponent loaded={this.state.loaded} {...this.props} />
        }
    }

    return hoistStatics(KootLoad, WrappedComponent)

}
