import React from 'react'
import { hydrate } from 'react-dom'
import { browserHistory, match } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore, applyMiddleware, compose } from 'redux'
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

        let options = Object.assign({}, settings)

        if (typeof this.store === 'undefined') {
            // __REDUX_STATE__ 是与服务端约定好的存储redux数据对象 (在浏览器端的 html 里存在)
            this.createConfigureStoreFactory()
            this.store = this.configureStore(window.__REDUX_STATE__)
        }

        // react-router
        browserHistory.listen(location => {
            // TODO:
            /*store.dispatch(realtimeLocationUpdate(location))
            if (typeof options.browserHistoryOnUpdate === 'function') 
                options.browserHistoryOnUpdate(location)*/
            if (typeof options.browserHistoryOnUpdate === 'function')
                options.browserHistoryOnUpdate(location, this.store)
        })

        // 

        const routes = this.react.router.get()

        // 用 react-router-redux 增强 history
        const history = syncHistoryWithStore(browserHistory, this.store)

        // 扩展 router 属性
        let ext = this.__reactRouterExt
        let root = this.rootDom

        // 设置常量
        setStore(this.store)
        setHistory(history)

        match({ history, routes }, (err/*, redirectLocation, renderProps*/) => {
            if (err) {
                console.log(err.stack)
            }
            hydrate(
                <Root
                    store={this.store}
                    history={history}
                    routes={routes}
                    {...ext}
                />,
                document.getElementById(root)
            )
        })

        // store = this.store

        return {
            store: this.store,
            history,
        }
    }

}
