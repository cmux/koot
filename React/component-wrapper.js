// TODO: All-in-one decorator for react component
// https://github.com/cmux/koot/issues/8

import React from 'react'
import { connect } from 'react-redux'
// import { hot } from 'react-hot-loader'
import hoistStatics from 'hoist-non-react-statics'
import { ImportStyle } from 'sp-css-import'

import { store, localeId } from '../index.js'

// 当前 meta 标签
let currentMetaTags
// meta 标签区域结尾的 HTML 注释代码
let nodeCommentEnd

// 是否已挂载了组件
let everMounted = false

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
 * @param {Object} [options.styles] 组件 CSS 结果
 * @param {Boolean} [options.hot=true] （仅针对开发模式）是否允许热加载/热更新
 * @returns {Function} 封装好的 React 组件
 */
export default (options = {}) => (WrappedComponent) => {

    const {
        connect: _connect = false,
        pageinfo,
        data: {
            fetch: dataFetch,
            check: dataCheck,
        } = {},
        styles,
        hot: _hot = true,
    } = options

    const doPageinfo = (store, props) => {
        if (typeof pageinfo !== 'function') return {}

        let infos = pageinfo(store.getState(), props)
        if (typeof infos !== 'object') infos = {}

        const {
            title = '',
            metas = []
        } = infos

        if (localeId)
            metas.push({
                name: 'koot-locale-id',
                content: localeId
            })

        return {
            title,
            metas
        }
    }

    class KootReactComponent extends React.Component {
        static onServerRenderHtmlExtend = ({ htmlTool, store, renderProps = {} }) => {
            const {
                title,
                metas
            } = doPageinfo(store, getPropsFromRenderProps(renderProps))
            htmlTool.title = title
            htmlTool.metas = metas
        }

        static onServerRenderStoreExtend({ store, renderProps }) {
            if (typeof dataFetch !== 'function')
                return new Promise(resolve => resolve())
            // console.log('onServerRenderStoreExtend')
            return dataFetch(store.getState(), getPropsFromRenderProps(renderProps), store.dispatch)
        }

        //

        clientUpdatePageInfo() {
            const {
                title,
                metas
            } = doPageinfo(store, getPropsFromComponentProps(this.props))
            clientUpdatePageInfo(title, metas)
        }

        //

        mounted = false
        state = {
            loaded: typeof dataCheck === 'function'
                ? dataCheck(store.getState(), getPropsFromComponentProps(this.props))
                : undefined,
        }

        //

        componentDidUpdate(prevProps) {
            if (typeof prevProps.location === 'object' &&
                typeof this.props.location === 'object' &&
                prevProps.location.pathname !== this.props.location.pathname
            )
                this.clientUpdatePageInfo()
        }

        componentDidMount() {
            this.mounted = true

            if (!this.state.loaded && typeof dataFetch === 'function') {
                dataFetch(store.getState(), getPropsFromComponentProps(this.props), store.dispatch)
                    .then(() => {
                        if (!this.mounted) return
                        this.setState({
                            loaded: true,
                        })
                    })
            }

            if (everMounted) {
                this.clientUpdatePageInfo()
            } else {
                everMounted = true
            }
        }

        componentWillUnmount() {
            this.mounted = false
        }

        //

        render = () => <WrappedComponent loaded={this.state.loaded} {...this.props} />
    }

    if (_hot && __DEV__ && __CLIENT__) {
        const { hot, setConfig } = require('react-hot-loader')
        setConfig({ logLevel: 'debug' })
        KootComponent = hot(module)(KootComponent)
    }

    let KootComponent = hoistStatics(KootReactComponent, WrappedComponent)

    if (typeof styles === 'object' &&
        typeof styles.wrapper === 'string'
    ) {
        KootComponent = ImportStyle(styles)(KootComponent)
    }

    if (_connect === true) {
        KootComponent = connect(() => ({}))(KootComponent)
    } else if (typeof _connect === 'function') {
        KootComponent = connect(_connect)(KootComponent)
    }

    return KootComponent
}

/**
 * 基于 renderProps 返回同构 props
 * @param {Object} renderProps 
 * @return {Object}
 */
const getPropsFromRenderProps = (renderProps = {}) => {
    return {
        ...renderProps
    }
}

/**
 * 基于组件 props 返回同构 props
 * @param {Object} componentProps 
 * @return {Object}
 */
const getPropsFromComponentProps = (componentProps = {}) => {
    return {
        ...componentProps
    }
}

/**
 * (浏览器环境) 更新页面信息
 * @param {String} title
 * @param {Object[]} metas
 */
const clientUpdatePageInfo = (title, metas = []) => {
    if (__SERVER__) return

    // 替换页面标题
    document.title = title

    // 替换 metas
    const head = document.getElementsByTagName('head')[0]
    if (!Array.isArray(currentMetaTags)) {
        currentMetaTags = []
        // 移除所有在 KOOT_METAS 里的 meta 标签
        // 采用 DOM 操作的初衷：如果使用 innerHTML 的字符串替换方法，浏览器可能会全局重新渲染一次，造成“闪屏”
        const childNodes = head.childNodes
        const nodesToRemove = []
        let meetStart = false
        let meetEnd = false
        let i = 0
        while (!meetEnd && childNodes[i] instanceof Node) {
            const node = childNodes[i]
            if (node.nodeType === Node.COMMENT_NODE) {
                if (node.nodeValue === __KOOT_INJECT_METAS_START__)
                    meetStart = true
                if (node.nodeValue === __KOOT_INJECT_METAS_END__) {
                    meetEnd = true
                    nodeCommentEnd = node
                }
            } else if (meetStart && node.nodeType === Node.ELEMENT_NODE && node.tagName === 'META') {
                nodesToRemove.push(node)
            }
            i++
        }
        nodesToRemove.forEach(el => head.removeChild(el))
    }

    currentMetaTags.forEach(el => {
        if (el && el.parentNode)
            el.parentNode.removeChild(el)
    })
    currentMetaTags = metas
        .filter(meta => typeof meta === 'object')
        .map(meta => {
            const el = document.createElement('meta')
            for (var key in meta) {
                el.setAttribute(key, meta[key])
            }
            // el.setAttribute(__KOOT_INJECT_ATTRIBUTE_NAME__, '')
            if (nodeCommentEnd) {
                head.insertBefore(el, nodeCommentEnd)
            } else {
                head.appendChild(el)
            }
            return el
        })
}
