// TODO: All-in-one decorator for react component
// https://github.com/cmux/koot/issues/8

import React from 'react'
import { connect } from 'react-redux'
// import { hot } from 'react-hot-loader'
// import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
// import { ImportStyle } from 'sp-css-import'

//

import { store, localeId } from '../index.js'

//

import {
    fromServerProps as getRenderPropsFromServerProps,
    fromComponentProps as getRenderPropsFromComponentProps
} from './get-render-props'
import {
    append as appendStyle,
    remove as removeStyle,
} from './styles'
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
        styles: _styles,
        // hot: _hot = true,
    } = options

    const styles = (!Array.isArray(_styles) ? [_styles] : styles).filter(obj => (
        typeof obj === 'object' && typeof obj.wrapper === 'string'
    ))
    const hasStyles = (
        Array.isArray(styles) &&
        styles.length > 0
    )

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
        kootClassNames = []

        //

        constructor(props) {
            super(props)

            if (hasStyles) {
                this.kootClassNames = styles.map(obj => obj.wrapper)
                appendStyle(styles)
                // console.log('----------')
                // console.log('styles', styles)
                // console.log('theStyles', theStyles)
                // console.log('this.classNameWrapper', this.classNameWrapper)
                // console.log('----------')
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
            if (hasStyles) {
                removeStyle(styles)
            }
        }

        //

        render = () => {
            // console.log('styles', styles)
            // console.log('this', this)
            // console.log('this.kootClassNames', this.kootClassNames)
            // console.log('this.props.className', this.props.className)
            if (__CLIENT__ && this.kootClassNames instanceof HTMLElement) {
                console.log(this.kootClassNames)
                this.kootClassNames = [this.kootClassNames.getAttribute('id')]
            }
            const props = Object.assign({}, this.props, {
                loaded: this.state.loaded,
                className: this.kootClassNames.concat(this.props.className).join(' ').trim(),
                "data-class-name": this.kootClassNames.join(' ').trim(),
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
