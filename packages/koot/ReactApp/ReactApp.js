import React from 'react'
import { hydrate } from 'react-dom'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import history from '../React/history'

//

import ReduxMiddleware from './ReduxMiddleware'
import ReduxReducer from './ReduxReducer'
import ReactRouter from './ReactRouter'

//

import Root from '../React/root.jsx'

//

// 默认根 DOM 结点 ID
const DEFAULT_ROOT_DOM_ID = 'root'

// redux store
export let store

// 设置常量
// setExtender(componentExtender)
// setPageinfo(pageinfo)
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
        // const history = require('../React/history').default

        if (typeof this.store === 'undefined') {
            // __REDUX_STATE__ 是与服务端约定好的存储redux数据对象 (在浏览器端的 html 里存在)
            this.createConfigureStoreFactory()
            this.store = this.configureStore(initialState)
        }

        // react-router
        history.listen(location => {
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

        // const routes = this.react.router.get()[0]
        const routes = (() => {
            const r = this.react.router.get()
            if (Array.isArray(r) && r.length === 1)
                return r[0]
            return r
        })()
        // delete routes.path

        // 用 react-router-redux 增强 history
        const thisHistory = syncHistoryWithStore(history, this.store)

        // 扩展 router 属性
        let ext = this.__reactRouterExt
        let root = this.rootDom

        // 设置常量
        window.Store = this.store
        window.History = thisHistory
        // window.LocaleId = this.store.getState().localeId

        // console.log('historyConfig', historyConfig)
        // console.log('history', thisHistory)
        // console.log('routes', routes)

        // require('react-router/lib/match')({ history, routes }, (err, ...args) => {
        //     console.log({ err, ...args })
        //     if (err) {
        //         console.log(err.stack)
        //     }
        // })
        hydrate(
            <Root
                store={this.store}
                history={thisHistory}
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
