import React from 'react'
import ReactDOM from 'react-dom'
import {
    Router,
    hashHistory,
    // browserHistory,
    // createMemoryHistory,
} from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import {
    reducer as realtimeLocationReducer,
    REALTIME_LOCATION_REDUCER_NAME,
    actionUpdate
} from 'sp-isomorphic-utils/realtime-location'
import {
    reducerLocaleId as i18nReducerLocaleId,
    reducerLocales as i18nReducerLocales,
} from 'super-project/i18n/redux'
import i18nRegister from 'super-project/i18n/register/spa.client'
import { ImportStyleRoot } from 'sp-css-import'
import { onRouterChange } from '@webUI/layout/header'




export default ({
    i18n = JSON.parse(process.env.SUPER_I18N) || false,
    router,
    redux,
    client
}) => {
    // ============================================================================
    // React 初始化
    // ============================================================================

    const reactApp = new ReactApp({ rootDom: 'root' })

    reactApp.redux.middleware.use(thunk)
    reactApp.redux.middleware.use(routerMiddleware(browserHistory))
    if (__CLIENT__) self.routerHistory = browserHistory




    // ============================================================================
    // Redux/Reducer 初始化
    // ============================================================================

    const reducers = {
        // 路由状态扩展
        [ROUTER_REDUCDER_NAME]: routerReducer,
        // 目的：新页面请求处理完成后再改变URL
        [REALTIME_LOCATION_REDUCER_NAME]: realtimeLocationReducer,
        // 对应服务器生成的store
        [SERVER_REDUCER_NAME]: serverReducer,
    }
    if (i18n) {
        reducers.localeId = i18nReducerLocaleId
        reducers.locales = i18nReducerLocales
    }

    // 兼容配置嵌套
    if (!redux)
        redux = client.redux

    const { combineReducers } = redux
    if (typeof combineReducers === 'object') {
        for (let key in combineReducers) {
            reducers[key] = combineReducers[key]
        }
    }
    for (let key in reducers) {
        reactApp.redux.reducer.use(key, reducers[key])
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
    reactApp.react.router.use({
        path: '',
        // component: App, 可扩展1层component
        childRoutes: [router]
    })




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
                if (__DEV__)
                    console.log(
                        `[super/client] ` +
                        `callback: onRouterUpdate`,
                        args
                    )
                // if (__DEV__) console.log('router onUpdate', self.__LATHPATHNAME__, location.pathname)
                if (typeof onRouterUpdate === 'function')
                    onRouterUpdate(...args)
            }
        })

        if (i18n) i18nRegister(__REDUX_STATE__)

        let beforePromise = before
        if (__DEV__)
            console.log(
                `[super/client] ` +
                `callback: before`,
                // args
            )
        if (typeof before === 'function') {
            beforePromise = new Promise(resolve => {
                before()
                    .then(() => resolve())
            })
        } else if (typeof before !== 'object' || typeof before.then !== 'function') {
            beforePromise = new Promise(resolve => resolve())
        }

        beforePromise.then(() =>
            reactApp.run({
                browserHistoryOnUpdate: (location, store) => {
                    // 回调: browserHistoryOnUpdate
                    // 正常路由跳转时，URL发生变化后瞬间会触发，顺序在react组件读取、渲染之前
                    if (__DEV__) {
                        console.log('🌏 browserHistory update', location)
                    }
                    // console.log(actionUpdate(location))
                    store.dispatch(actionUpdate(location))
                    // console.log(store.getState())

                    if (__DEV__)
                        console.log(
                            `[super/client] ` +
                            `callback: onHistoryUpdate`,
                            [location, store]
                        )
                    if (typeof onHistoryUpdate === 'function')
                        onHistoryUpdate(location, store)
                }
            })
        )
            .then((appData) => {
                if (__DEV__)
                    console.log(
                        `[super/client] ` +
                        `callback: after`,
                        [appData]
                    )
                if (typeof after === 'function') after(appData)
            })
    }




    // ============================================================================
    // 结束
    // ============================================================================
    return reactApp
}
