import React from 'react'
import { hydrate } from 'react-dom'
// import browserHistory from 'react-router/lib/browserHistory'
// import match from 'react-router/lib/match'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore, applyMiddleware, compose } from 'redux'
// import browserHistory from 'react-router/lib/browserHistory'
// import match from 'react-router/lib/match'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { parsePath } from 'history/lib/PathUtils'
// let render = (() => {
//     if (__DEV__) {
//         const { render } = require('react-dom')
//         return render
//     } else {
//         const { hydrate } = require('react-dom')
//         return hydrate
//     }
// })()

//

import ReduxMiddleware from './ReduxMiddleware'
import ReduxReducer from './ReduxReducer'
import ReactRouter from './ReactRouter'

//

import {
    setStore,
    setHistory,
    setExtender,
    setPageinfo,
    // setFetchdata,
} from '../'
import componentExtender from '../React/component-extender'
import pageinfo from '../React/pageinfo'
// import fetchdata from '../React/fetchdata'
import Root from '../React/root.jsx'

// import ACTION_TYPE from './action-types'

// 默认根 DOM 结点 ID
const DEFAULT_ROOT_DOM_ID = 'root'

// redux store
export let store

// 设置常量
setExtender(componentExtender)
setPageinfo(pageinfo)
// setFetchdata(fetchdata)

export default class ReactApp {

    constructor(opt) {

        // 实例化1个 Koa 对象

        // this.app = ((Koa) => new Koa())(require('koa'))

        this.rootDom = (opt && opt.rootDom) ? opt.rootDom : DEFAULT_ROOT_DOM_ID

        // redux

        const reduxMiddleware = new ReduxMiddleware()
        const reduxReducer = new ReduxReducer()

        this.redux = {
            middleware: reduxMiddleware,
            reducer: reduxReducer
        }
        this.store = undefined


        // react

        let reactRouter = new ReactRouter()
        this.__reactRouterExt = {} // 用于扩展客户端路由属性

        this.react = {
            router: {
                use: (router) => reactRouter.add(router),
                get: () => reactRouter.get(),
                ext: (ext) => Object.assign(this.__reactRouterExt, ext) // 扩展客户端路由
            }
        }

    }

    createConfigureStoreFactory() {
        const reducers = this.redux.reducer.get()
        const middlewares = this.redux.middleware.get()

        this.configureStore = this.factoryConfigureStore(reducers, middlewares)
        return this.configureStore
    }

    factoryConfigureStore(reducers, middlewares) {

        // redux调试

        let devToolsExtension = (f) => f
        if (__CLIENT__ && __DEV__) {
            if (window.devToolsExtension) {
                devToolsExtension = window.devToolsExtension()
            }
        }

        //

        return (initialState) => {
            let store
            if (__DEV__) {
                store = createStore(reducers, initialState, compose(
                    applyMiddleware(...middlewares),
                    devToolsExtension
                ))
            } else {
                store = createStore(reducers, initialState, compose(
                    applyMiddleware(...middlewares)
                ))
            }
            return store
        }
    }


    /**
     * 客户端/浏览器环境运行
     * @param {Object} settings 
     */
    run(settings = {}) {

        const options = Object.assign({}, settings)
        const initialState = window.__REDUX_STATE__ || {}

        if (typeof this.store === 'undefined') {
            // __REDUX_STATE__ 是与服务端约定好的存储redux数据对象 (在浏览器端的 html 里存在)
            this.createConfigureStoreFactory()
            this.store = this.configureStore(initialState)
        }

        // react-router
        const historyConfig = { basename: '/' }
        if (JSON.parse(process.env.KOOT_I18N) &&
            process.env.KOOT_I18N_URL_USE === 'router' &&
            initialState.localeId
        ) {
            historyConfig.basename = `/${initialState.localeId}`
        }
        // const browserHistory = useRouterHistory(createBrowserHistory)(historyConfig)
        // const theHistory = useBasename(() => browserHistory)(historyConfig)
        // const theHistory = createBrowserHistory(historyConfig)
        // const theHistory = useRouterHistory(createBrowserHistory)(historyConfig)
        // const theHistory = CreateHistoryEnhancer((...args) => {
        //     console.log(...args)
        //     return browserHistory
        // })()
        const theHistory = kootUseBasename(createBrowserHistory)(historyConfig)
        theHistory.listen(location => {
            // console.log('pathname', location.pathname) // /hello/world
            // console.log('basename', location.basename) // /base
            // TODO:
            /*store.dispatch(realtimeLocationUpdate(location))
            if (typeof options.browserHistoryOnUpdate === 'function') 
                options.browserHistoryOnUpdate(location)*/
            if (typeof options.browserHistoryOnUpdate === 'function')
                options.browserHistoryOnUpdate(location, this.store)
        })

        // 

        const routes = this.react.router.get()[0]
        // delete routes.path

        // 用 react-router-redux 增强 history
        const history = syncHistoryWithStore(theHistory, this.store)

        // 扩展 router 属性
        let ext = this.__reactRouterExt
        let root = this.rootDom

        // 设置常量
        setStore(this.store)
        setHistory(history)

        // console.log('historyConfig', historyConfig)
        // console.log('history', theHistory, history)
        // console.log('routes', routes)

        // match({ history, routes }, (err, ...args) => {
        //     console.log({ err, ...args })
        //     if (err) {
        //         console.log(err.stack)
        //     }
        // })
        hydrate(
            <Root
                store={this.store}
                history={history}
                routes={routes}
                // onError={(...args) => console.log('route onError', ...args)}
                // onUpdate={(...args) => console.log('route onUpdate', ...args)}
                {...ext}
            />,
            document.getElementById(root)
        )

        // window.HISTORY = history
        // store = this.store

        return {
            store: this.store,
            history,
        }
    }

}


/**
 * History Enhancer: use basename
 * 
 * Original useBasename enhancer from history also override all read methods
 * `getCurrentLocation` `listenBefore` `listen`
 * But as Diablohu tested, when read methods overrided, if the route matched used async method to get component, would fail
 * that rendering blank page and no route match event fired
 * So we only overrid write methods here. And modify the first level path in routes object to `:localeId`
 * 
 * @param {Function} createHistory
 * @returns {Object} History
 */
const kootUseBasename = (createHistory) =>
    (options = {}) => {
        const history = createHistory(options)
        const { basename } = options

        const addBasename = (location) => {
            if (!location)
                return location

            if (basename && location.basename == null) {
                if (location.pathname.toLowerCase().indexOf(basename.toLowerCase()) === 0) {
                    location.pathname = location.pathname.substring(basename.length)
                    location.basename = basename

                    if (location.pathname === '')
                        location.pathname = '/'
                } else {
                    location.basename = ''
                }
            }

            return location
        }

        const prependBasename = (location) => {
            if (!basename)
                return location

            const object = typeof location === 'string' ? parsePath(location) : location
            const pname = object.pathname
            const normalizedBasename = basename.slice(-1) === '/' ? basename : `${basename}/`
            const normalizedPathname = pname.charAt(0) === '/' ? pname.slice(1) : pname
            const pathname = normalizedBasename + normalizedPathname

            return {
                ...object,
                pathname
            }
        }

        // Override all write methods with basename-aware versions.
        const push = (location) =>
            history.push(prependBasename(location))

        const replace = (location) =>
            history.replace(prependBasename(location))

        const createPath = (location) =>
            history.createPath(prependBasename(location))

        const createHref = (location) =>
            history.createHref(prependBasename(location))

        const createLocation = (location, ...args) =>
            addBasename(history.createLocation(prependBasename(location), ...args))

        return {
            ...history,
            push,
            replace,
            createPath,
            createHref,
            createLocation
        }
    }
