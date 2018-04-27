import React from 'react'
import { hydrate } from 'react-dom'
import { browserHistory, match, Router } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'

//

import ReduxMiddleware from './ReduxMiddleware'
import ReduxReducer from './ReduxReducer'
import ReactRouter from './ReactRouter'

//

import ReactIsomorphic from './ReactIsomorphic'
import ACTION_TYPE from './ActionType'

// 默认根 DOM 结点 ID

const DEFAULT_ROOT_DOM_ID = 'root'

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

        this.isomorphic = new ReactIsomorphic()
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


    run(settings = {}) {

        let options = Object.assign({}, settings)

        // __REDUX_STATE__ 是与服务端约定好的存储redux数据对象 (在浏览器端的 html 里存在)
        this.createConfigureStoreFactory()
        const store = this.configureStore(window.__REDUX_STATE__)

        // react-router
        browserHistory.listen(location => {
            // TODO:
            /*store.dispatch(realtimeLocationUpdate(location))
            if (typeof options.browserHistoryOnUpdate === 'function') 
                options.browserHistoryOnUpdate(location)*/
            if (typeof options.browserHistoryOnUpdate === 'function') 
                options.browserHistoryOnUpdate(location, store)
        })

        // 

        const routes = this.react.router.get()

        // 用 react-router-redux 增强 history
        const history = syncHistoryWithStore(browserHistory, store)

        // 扩展 router 属性
        let ext = this.__reactRouterExt

        let root = this.rootDom

        match({ history, routes }, (err, redirectLocation, renderProps) => {
            if (err) {
                console.log(err.stack)
            }
            hydrate(
                <Provider store={store} >
                    <Router history={history} {...ext } >
                        {routes}
                    </Router>
                </Provider>,
                document.getElementById(root)
            )
        })

        return {
            store
        }
    }

}
