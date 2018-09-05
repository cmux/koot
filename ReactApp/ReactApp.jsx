import { createStore, applyMiddleware, compose } from 'redux'

//

import ReduxMiddleware from './ReduxMiddleware'
import ReduxReducer from './ReduxReducer'
import ReactRouter from './ReactRouter'

//

import {
    setPageinfo,
} from '../'
import pageinfo from '../React/pageinfo'

// import ACTION_TYPE from './ActionType'

// 默认根 DOM 结点 ID
const DEFAULT_ROOT_DOM_ID = 'root'

// redux store
// export let store

// 设置常量
setPageinfo(pageinfo)

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
}
