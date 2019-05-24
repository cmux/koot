/* global __KOOT_SSR__:false */

import React from 'react';
import { connect } from 'react-redux';
// import { hot } from 'react-hot-loader'
// import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics';

import { getStore } from '../../';

//

import {
    fromServerProps as getRenderPropsFromServerProps,
    fromComponentProps as getRenderPropsFromComponentProps
} from '../get-render-props';
import {
    append as appendStyle,
    remove as removeStyle
    // StyleMapContext,
} from '../styles';
import clientUpdatePageInfo from '../client-update-page-info';

//

// 是否已挂载了组件
let everMounted = false;
// const defaultPageInfo = {
//     title: '',
//     metas: []
// }
const styleMap = {};

/**
 * @type {Number}
 * _开发环境_
 * _服务器_
 * 使用该高阶组件的次数
 */
let devSSRConnectIndex = 0;

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
 * 获取同构数据的执行方法
 * @param {Object} store
 * @param {Object} props renderProps
 * @returns {Promise}
 */
const doFetchData = (store, renderProps, dataFetch) => {
    const result = dataFetch(store.getState(), renderProps, store.dispatch);
    // if (result === true) {
    //     isDataPreloaded = true
    //     return new Promise(resolve => resolve())
    // }
    if (Array.isArray(result)) return Promise.all(result);
    if (result instanceof Promise) return result;
    return new Promise(resolve => resolve(result));
};

/**
 * 更新页面信息
 * @param {Object} store
 * @param {Object} props renderProps
 * @returns {Object} infos
 * @returns {String} infos.title
 * @returns {Array} infos.metas
 */
const doPageinfo = (store, props, pageinfo) => {
    const defaultPageInfo = {
        title: '',
        metas: []
    };

    if (typeof pageinfo !== 'function' && typeof pageinfo !== 'object')
        return defaultPageInfo;

    const state = store.getState();
    const infos = (() => {
        if (typeof pageinfo === 'object') return pageinfo;
        const infos = pageinfo(state, props);
        if (typeof infos !== 'object') return defaultPageInfo;
        return infos;
    })();

    const {
        title = defaultPageInfo.title,
        metas = defaultPageInfo.metas
    } = infos;

    if (state.localeId) {
        if (
            !metas.some(meta => {
                if (meta.name === 'koot-locale-id') {
                    meta.content = state.localeId;
                    return true;
                }
                return false;
            })
        ) {
            metas.push({
                name: 'koot-locale-id',
                content: state.localeId
            });
        }
    }

    return {
        title,
        metas
    };
};

// console.log((typeof store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' store in [HOC] extend')
/**
 * 高阶组件/组件装饰器：组件扩展
 * @module
 * @param {Object} options 选项
 * @param {Boolean|Function} [options.connect] react-redux 的 connect() 的参数。如果为 true，表示使用 connect()，但不连接任何数据
 * @param {Object|callbackGetPageInfo} [options.pageinfo]
 * @param {Object} [options.data] 同构数据相关
 * @param {callbackFetchData} [options.data.fetch]
 * @param {callbackCheckLoaded} [options.data.check]
 * @param {Object} [options.styles] 组件 CSS 结果
 * @returns {Function} 封装好的 React 组件
 */
export default (options = {}) => WrappedComponent => {
    // console.log((typeof store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' store in [HOC] extend run')

    const {
        connect: _connect = false,
        pageinfo,
        data: { fetch: _dataFetch, check: dataCheck } = {},
        styles: _styles
        // ttt
        // hot: _hot = true,
        // name
    } = options;

    // console.log('extend hoc run', { name, LocaleId })

    // 样式相关

    /** @type {Object} 经过 koot-css-loader 处理后的 css 文件的结果对象 */
    const styles = (!Array.isArray(_styles) ? [_styles] : _styles).filter(
        obj => typeof obj === 'object' && typeof obj.wrapper === 'string'
    );

    /** @type {Boolean} 是否有上述结果对象 */
    const hasStyles = Array.isArray(styles) && styles.length > 0;
    // console.log({ ttt, hasStyles, styles })

    // 同构数据相关

    /** @type {Boolean} 同构数据是否已经获取成功 */
    // let isDataPreloaded = false

    /** @type {Function} 获取同构数据 */
    const dataFetch =
        typeof options.data === 'function' || Array.isArray(options.data)
            ? options.data
            : typeof _dataFetch === 'function' || Array.isArray(_dataFetch)
            ? _dataFetch
            : undefined;

    // 装饰组件

    class KootReactComponent extends React.Component {
        static onServerRenderHtmlExtend = ({ store, renderProps = {} }) => {
            const { title, metas } = doPageinfo(
                store,
                getRenderPropsFromServerProps(renderProps),
                pageinfo
            );
            return { title, metas };
        };

        //

        // static contextType = StyleMapContext

        //

        clientUpdatePageInfo() {
            if (typeof pageinfo !== 'function' && typeof pageinfo !== 'object')
                return;

            const { title, metas } = doPageinfo(
                getStore(),
                getRenderPropsFromComponentProps(this.props),
                pageinfo
            );
            clientUpdatePageInfo(title, metas);
        }

        //

        state = {
            loaded:
                typeof dataCheck === 'function'
                    ? dataCheck(
                          getStore().getState(),
                          getRenderPropsFromComponentProps(this.props)
                      )
                    : undefined
        };
        mounted = false;
        kootClassNames = [];

        //

        constructor(props /*, context*/) {
            super(props /*, context*/);

            if (hasStyles) {
                this.kootClassNames = styles.map(obj => obj.wrapper);
                appendStyle(this.getStyleMap(/*context*/), styles);
                // console.log('----------')
                // console.log('styles', styles)
                // console.log('theStyles', theStyles)
                // console.log('this.classNameWrapper', this.classNameWrapper)
                // console.log('----------')
            }
        }

        /**
         * 获取 styleMap
         * - 服务器端: 返回全局常量中的对照表
         * - 客户端: 直接返回本文件内的 styleMap
         */
        getStyleMap(/*context*/) {
            // console.log('extend', { LocaleId })
            if (__SERVER__) {
                if (__DEV__) return global.__KOOT_SSR__.styleMap;
                if (typeof __KOOT_SSR__ === 'object')
                    return __KOOT_SSR__.styleMap;
            }
            return styleMap;
            // return context
        }

        //

        componentDidUpdate(prevProps) {
            if (
                typeof prevProps.location === 'object' &&
                typeof this.props.location === 'object' &&
                prevProps.location.pathname !== this.props.location.pathname
            )
                this.clientUpdatePageInfo();
        }

        componentDidMount() {
            this.mounted = true;

            if (!this.state.loaded && typeof dataFetch !== 'undefined') {
                doFetchData(
                    getStore(),
                    getRenderPropsFromComponentProps(this.props),
                    dataFetch
                ).then(() => {
                    if (!this.mounted) return;
                    this.setState({
                        loaded: true
                    });
                });
            }

            this.clientUpdatePageInfo();
            if (everMounted) {
            } else {
                everMounted = true;
            }
        }

        componentWillUnmount() {
            this.mounted = false;
            if (hasStyles) {
                removeStyle(this.getStyleMap(/*this.context*/), styles);
            }
        }

        //

        render = () => {
            // console.log('styles', styles)
            // console.log('this', this)
            // console.log('this.kootClassNames', this.kootClassNames)
            // console.log('this.props.className', this.props.className)

            if (__CLIENT__ && this.kootClassNames instanceof HTMLElement) {
                // console.log(this.kootClassNames)
                this.kootClassNames = [this.kootClassNames.getAttribute('id')];
            }

            const props = Object.assign({}, this.props, {
                className: this.kootClassNames
                    .concat(this.props.className)
                    .join(' ')
                    .trim(),
                'data-class-name': this.kootClassNames.join(' ').trim()
            });

            // if (__SERVER__) console.log('extender this.state.loaded', this.state.loaded)
            if (
                typeof dataFetch !== 'undefined' &&
                typeof dataCheck === 'function'
            )
                props.loaded = this.state.loaded;

            return <WrappedComponent {...props} />;
        };
    }

    if (typeof dataFetch !== 'undefined') {
        KootReactComponent.onServerRenderStoreExtend = ({
            store,
            renderProps
        }) => {
            if (typeof dataFetch === 'undefined')
                return new Promise(resolve => resolve());
            // console.log('onServerRenderStoreExtend')
            return doFetchData(
                store,
                getRenderPropsFromServerProps(renderProps),
                dataFetch
            );
        };
    }

    // if (_hot && __DEV__ && __CLIENT__) {
    //     const { hot, setConfig } = require('react-hot-loader')
    //     setConfig({ logLevel: 'debug' })
    //     KootComponent = hot(module)(KootComponent)
    // }

    let KootComponent = hoistStatics(KootReactComponent, WrappedComponent);

    // if (typeof styles === 'object' &&
    //     typeof styles.wrapper === 'string'
    // ) {
    //     KootComponent = ImportStyle(styles)(KootComponent)
    // }

    if (_connect === true) {
        KootComponent = connect(() => ({}))(KootComponent);
    } else if (typeof _connect === 'function') {
        KootComponent = connect(_connect)(KootComponent);
    } else if (Array.isArray(_connect)) {
        KootComponent = connect(..._connect)(KootComponent);
    }

    /**
     * _服务器端_
     * 将组件注册到同构渲染对象中
     */
    if (__SERVER__) {
        if (__DEV__) KootComponent.id = devSSRConnectIndex++;
        const { connectedComponents = [] } = __DEV__
            ? global.__KOOT_SSR__
            : __KOOT_SSR__;
        connectedComponents.push(KootComponent);
    }

    return KootComponent;
};
