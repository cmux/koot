// TODO: All-in-one decorator for react component
// https://github.com/cmux/koot/issues/8

import React from 'react'
import { connect } from 'react-redux'
// import { hot } from 'react-hot-loader'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
// import { ImportStyle } from 'sp-css-import'

//

import { store, localeId } from '../index.js'

//

import {
    fromServerProps as getRenderPropsFromServerProps,
    fromComponentProps as getRenderPropsFromComponentProps
} from './get-render-props'
import clientUpdatePageInfo from './client-update-page-info'

//

// 是否已挂载了组件
let everMounted = false
const defaultPageInfo = {
    title: '',
    metas: []
}

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
        // hot: _hot = true,
    } = options

    const doPageinfo = (store, props) => {
        if (typeof pageinfo !== 'function')
            return { ...defaultPageInfo }

        let infos = pageinfo(store.getState(), props)
        if (typeof infos !== 'object')
            infos = { ...defaultPageInfo }

        const {
            title = defaultPageInfo.title,
            metas = defaultPageInfo.metas
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
            } = doPageinfo(store, getRenderPropsFromServerProps(renderProps))
            htmlTool.title = title
            htmlTool.metas = metas
        }

        static onServerRenderStoreExtend({ store, renderProps }) {
            if (typeof dataFetch !== 'function')
                return new Promise(resolve => resolve())
            // console.log('onServerRenderStoreExtend')
            return dataFetch(
                store.getState(),
                getRenderPropsFromServerProps(renderProps),
                store.dispatch
            )
        }

        static contextTypes = {
            appendStyle: PropTypes.func,
            removeStyle: PropTypes.func
        }

        //

        clientUpdatePageInfo() {
            if (typeof pageinfo !== 'function')
                return

            const {
                title,
                metas
            } = doPageinfo(store, getRenderPropsFromComponentProps(this.props))
            clientUpdatePageInfo(title, metas)
        }

        //

        state = {
            loaded: typeof dataCheck === 'function'
                ? dataCheck(store.getState(), getRenderPropsFromComponentProps(this.props))
                : undefined,
        }
        mounted = false
        classNameWrapper = (typeof styles === 'object' && typeof styles.wrapper === 'string')
            ? stylesHandleWapperCssLoader(styles).map(obj => obj.wrapper)
            : []

        //

        constructor(props, context) {
            super(props, context)

            if (typeof styles !== 'object' || typeof styles.wrapper !== 'string') {
            } else if (context && typeof context.appendStyle === 'function')
                context.appendStyle(styles)
            else if (__DEV__) {
                console.warn(`It seems that a component has no \`appendStyle\` function in \`context\`. Have you use \`ImportStyleRoot\` to the root component?`)
                console.warn('Related component: ', this)
            }
        }

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
                dataFetch(store.getState(), getRenderPropsFromComponentProps(this.props), store.dispatch)
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

            if (this.context && this.context.removeStyle)
                this.context.removeStyle(styles)
        }

        //

        render = () => {
            const props = Object.assign({}, this.props, {
                loaded: this.state.loaded,
                className: this.classNameWrapper.concat(this.props.className).join(' ').trim(),
                "data-class-name": this.classNameWrapper.join(' ').trim(),
            })
            return <WrappedComponent {...props} />
        }
    }

    // if (_hot && __DEV__ && __CLIENT__) {
    //     const { hot, setConfig } = require('react-hot-loader')
    //     setConfig({ logLevel: 'debug' })
    //     KootComponent = hot(module)(KootComponent)
    // }

    let KootComponent = hoistStatics(KootReactComponent, WrappedComponent)

    // if (typeof styles === 'object' &&
    //     typeof styles.wrapper === 'string'
    // ) {
    //     KootComponent = ImportStyle(styles)(KootComponent)
    // }

    if (_connect === true) {
        KootComponent = connect(() => ({}))(KootComponent)
    } else if (typeof _connect === 'function') {
        KootComponent = connect(_connect)(KootComponent)
    }

    return KootComponent
}

// 统一处理，把 string, object 都转化成array
const stylesHandleWapperCssLoader = (styles) => {

    // 如果是对象
    if (typeof styles === 'object' && !styles.length) {
        styles = [styles]
    }

    if (typeof styles === 'object' && styles.length) {
        return styles
    }

    throw 'stylesHandleWapperCssLoader() styles type must be array or object'
}
