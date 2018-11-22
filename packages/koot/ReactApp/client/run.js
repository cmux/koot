// import thunk from 'redux-thunk'
// import { browserHistory } from 'react-router'
// import { routerMiddleware } from 'react-router-redux'

//

import { ReactApp } from '../index'
import { actionUpdate } from '../../React/realtime-location'
import i18nRegister from '../../i18n/register/isomorphic.client'
import { reducers, middlewares } from '../../React/redux'

//

let logCountRouterUpdate = 0
let logCountHistoryUpdate = 0




export default ({
    i18n = JSON.parse(process.env.KOOT_I18N) || false,
    router,
    redux,
    // store,
    client
}) => {
    // ============================================================================
    // React 初始化
    // ============================================================================

    const reactApp = new ReactApp({ rootDom: 'root' })

    if (typeof redux.store === 'undefined') {
        middlewares.forEach(middleware => {
            // console.log(middleware)
            reactApp.redux.middleware.use(middleware)
        })
        // reactApp.redux.middleware.use(thunk)
        // reactApp.redux.middleware.use(routerMiddleware(browserHistory))
        // const routerHistory = browserHistory
        // if (__CLIENT__) self.routerHistory = browserHistory
    }




    // ============================================================================
    // Redux/Reducer 初始化
    // ============================================================================

    // 兼容配置嵌套
    if (!redux)
        redux = client.redux

    if (typeof redux.store === 'undefined') {
        const { combineReducers } = redux
        if (typeof combineReducers === 'object') {
            for (let key in combineReducers) {
                // reducers[key] = combineReducers[key]
                reactApp.redux.reducer.use(key, combineReducers[key])
            }
        }
        for (let key in reducers) {
            reactApp.redux.reducer.use(key, reducers[key])
        }
    } else if (typeof redux.store === 'function' && __CLIENT__) {
        reactApp.store = redux.store()
    } else {
        reactApp.store = redux.store
    }




    // ============================================================================
    // 路由初始化
    // ============================================================================
    if (typeof router !== 'object') {
        if (client.router) // 兼容配置嵌套
            router = client.router
        else
            router = {}
    }

    // 2018/10/20 
    // add by mazhenyu(@zrainma@sina.com)
    // 去掉默认外部的根结构，前端传入已处理
    reactApp.react.router.use(router)




    // ============================================================================
    // 客户端专用初始化流程
    // ============================================================================

    if (__CLIENT__) {
        const {
            before,
            after,
        } = client
        const onRouterUpdate = client.routerUpdate || client.onRouterUpdate
        const onHistoryUpdate = client.historyUpdate || client.onHistoryUpdate

        reactApp.react.router.ext({
            onUpdate: (...args) => {
                if (__DEV__ && logCountRouterUpdate < 2) {
                    console.log(
                        `🚩 [koot/client] ` +
                        `callback: onRouterUpdate`,
                        ...args
                    )
                    logCountRouterUpdate++
                }
                // if (__DEV__) console.log('router onUpdate', self.__LATHPATHNAME__, location.pathname)
                if (typeof onRouterUpdate === 'function')
                    onRouterUpdate(...args)
            }
        })

        if (i18n) i18nRegister(__REDUX_STATE__)

        if (__DEV__)
            console.log(
                `🚩 [koot/client] ` +
                `callback: before`,
                // args
            )
        const beforePromise = (() => {
            const _before = typeof before === 'function' ? before() : before

            if (typeof _before === 'object' && typeof _before.then === 'function') {
                return _before
            }

            return new Promise(resolve => {
                if (typeof _before === 'function')
                    _before()
                resolve()
            })
        })()
        beforePromise.then(() =>
            reactApp.run({
                browserHistoryOnUpdate: (location, store) => {
                    // 回调: browserHistoryOnUpdate
                    // 正常路由跳转时，URL发生变化后瞬间会触发，顺序在react组件读取、渲染之前
                    // if (__DEV__) {
                    //     console.log('🌏 browserHistory update', location)
                    // }
                    // console.log(actionUpdate(location))
                    store.dispatch(actionUpdate(location))
                    // console.log(store.getState())

                    if (__DEV__ && logCountHistoryUpdate < 2) {
                        console.log(
                            `🚩 [koot/client] ` +
                            `callback: onHistoryUpdate`,
                            [location, store]
                        )
                        logCountHistoryUpdate++
                    }
                    if (typeof onHistoryUpdate === 'function')
                        onHistoryUpdate(location, store)
                }
            })
        )
            .then((appData) => {
                if (__DEV__)
                    console.log(
                        `🚩 [koot/client] ` +
                        `callback: after`,
                        appData
                    )
                if (typeof after === 'function') after(appData)
            })
    }




    // ============================================================================
    // 结束
    // ============================================================================
    return reactApp
}
