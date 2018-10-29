// TODO: i18n

const React = require('react')
import ReactDOM from 'react-dom'
import {
    // Router,
    hashHistory,
    // browserHistory,
    // createMemoryHistory,
} from 'react-router'
import { syncHistoryWithStore/*, routerReducer*/ } from 'react-router-redux'
// import { Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

//

import {
    setStore,
    setHistory,
    setExtender,
    setPageinfo,
    // setFetchdata,
} from '../../'
import componentExtender from '../../React/component-extender'
import pageinfo from '../../React/pageinfo'
// import fetchdata from '../../React/fetchdata'
import {
    // reducer as realtimeLocationReducer,
    // REALTIME_LOCATION_REDUCER_NAME,
    actionUpdate,
} from '../../React/realtime-location'
import Root from '../../React/root.jsx'
import { reducers } from '../../React/redux'
// import {
//     reducerLocaleId as i18nReducerLocaleId,
//     reducerLocales as i18nReducerLocales,
// } from 'koot/i18n/redux'
// import i18nRegister from 'koot/i18n/register/spa.client'
// import { ImportStyleRoot } from 'sp-css-import'


// ============================================================================
// 设置常量 & 变量
// ============================================================================

// const ROUTER_REDUCDER_NAME = 'routing'
let logCountRouterUpdate = 0
let logCountHistoryUpdate = 0
setExtender(componentExtender)
setPageinfo(pageinfo)
// setFetchdata(fetchdata)



export default ({
    // i18n = JSON.parse(process.env.KOOT_I18N) || false,
    router,
    redux,
    // store,
    client
}) => {
    const {
        before,
        after,
    } = client
    const onRouterUpdate = client.routerUpdate || client.onRouterUpdate
    const onHistoryUpdate = client.historyUpdate || client.onHistoryUpdate

    // ============================================================================
    // Redux/Reducer 初始化
    // ============================================================================

    // const reducersObject = {
    //     // 路由状态扩展
    //     [ROUTER_REDUCDER_NAME]: routerReducer,
    //     // 目的：新页面请求处理完成后再改变URL
    //     [REALTIME_LOCATION_REDUCER_NAME]: realtimeLocationReducer,
    //     // 对应服务器生成的store
    //     // [SERVER_REDUCER_NAME]: serverReducer,
    // }
    // if (i18n) {
    //     reducersObject.localeId = i18nReducerLocaleId
    //     reducersObject.locales = i18nReducerLocales
    // }

    // 兼容配置嵌套
    if (!redux) redux = client.redux

    let store
    if (typeof redux.store === 'undefined') {
        {
            const { combineReducers } = redux
            if (typeof combineReducers === 'object') {
                for (let key in combineReducers) {
                    reducers[key] = combineReducers[key]
                }
            }
        }
        store = compose(applyMiddleware(thunk))(createStore)(combineReducers(reducers))
    } else {
        store = redux.store
    }
    console.log(
        redux,
        store
    )





    // ============================================================================
    // i18n 初始化
    // ============================================================================
    // if (i18n) i18nRegister(i18n, store)





    // ============================================================================
    // 路由初始化
    // ============================================================================
    if (typeof router !== 'object') {
        if (client.router) // 兼容配置嵌套
            router = client.router
        else
            router = {}
    }
    const routerConfig = {
        // history: syncHistoryWithStore(memoryHistory, store),
        history: syncHistoryWithStore(hashHistory, store),
        routes: router,
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
    }
    if (typeof routerConfig.routes.path === 'undefined')
        routerConfig.routes.path = '/'
    const history = hashHistory
    // if (__CLIENT__) self.routerHistory = memoryHistory
    // if (__CLIENT__) self.routerHistory = hashHistory

    // memoryHistory.listen(location => {
    hashHistory.listen(location => {
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
    })





    // ============================================================================
    // 设置常量
    // ============================================================================

    setStore(store)
    setHistory(history)




    // ============================================================================
    // React 初始化
    // ============================================================================

    if (__DEV__)
        console.log(
            `🚩 [koot/client] ` +
            `callback: before`,
            // args
        )
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

    beforePromise
        .then(() => {
            if (__DEV__)
                console.log(
                    `🚩 [koot/client] ` +
                    `callback: after`,
                    { store, history }
                )
            if (typeof after === 'function')
                after({
                    store, history
                })
        })
        .then(() => {
            // console.log('store', store)
            // console.log('routerConfig', routerConfig)

            const { history, routes, ...ext } = routerConfig

            ReactDOM.render(
                <Root
                    store={store}
                    history={history}
                    routes={routes}
                    {...ext}
                />,
                document.getElementById('root')
            )

            return true
        })
}
