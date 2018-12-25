// TODO: i18n

const React = require('react')
import ReactDOM from 'react-dom'
import history from "../../React/history"
import { syncHistoryWithStore } from 'react-router-redux'

//

import {
    localeId as LocaleId,
    store as Store,
    history as History
} from '../../index'
import { actionUpdate } from '../../React/realtime-location'
import Root from '../../React/root.jsx'
import validateRouterConfig from '../../React/validate/router-config'
// import {
//     reducerLocaleId as i18nReducerLocaleId,
//     reducerLocales as i18nReducerLocales,
// } from 'koot/i18n/redux'
// import i18nRegister from 'koot/i18n/register/spa.client'


// ============================================================================
// 设置常量 & 变量
// ============================================================================

let logCountRouterUpdate = 0
let logCountHistoryUpdate = 0



export default ({
    router,
    client
}) => {
    // console.log({
    //     router,
    //     redux,
    //     client
    // })

    const {
        before,
        after,
    } = client
    const onRouterUpdate = client.routerUpdate || client.onRouterUpdate
    const onHistoryUpdate = client.historyUpdate || client.onHistoryUpdate





    // ============================================================================
    // i18n 初始化
    // ============================================================================
    // if (i18n) i18nRegister(i18n, store)





    // ============================================================================
    // 路由初始化
    // ============================================================================
    const routes = validateRouterConfig(router)
    if (typeof routes.path === 'undefined')
        routes.path = '/'
    const thisHistory = syncHistoryWithStore(History, Store)
    const routerConfig = {
        // history: syncHistoryWithStore(memoryHistory, store),
        history: thisHistory,
        routes,
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
    // const history = hashHistory
    // if (__CLIENT__) self.routerHistory = memoryHistory
    // if (__CLIENT__) self.routerHistory = hashHistory

    // memoryHistory.listen(location => {
    thisHistory.listen(location => {
        // if (__DEV__) {
        //     console.log('🌏 browserHistory update', location)
        // }
        // console.log(actionUpdate(location))
        Store.dispatch(actionUpdate(location))
        // console.log(store.getState())

        if (__DEV__ && logCountHistoryUpdate < 2) {
            console.log(
                `🚩 [koot/client] ` +
                `callback: onHistoryUpdate`,
                [location, Store]
            )
            logCountHistoryUpdate++
        }
        if (typeof onHistoryUpdate === 'function')
            onHistoryUpdate(location, Store)
    })




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
                    { Store, history }
                )
            if (typeof after === 'function')
                after({
                    Store, history
                })
        })
        .then(() => {
            // console.log('store', store)
            // console.log('routerConfig', routerConfig)

            const { history, routes, ...ext } = routerConfig
            // console.log(routes)

            ReactDOM.render(
                <Root
                    store={Store}
                    history={history}
                    routes={routes}
                    {...ext}
                />,
                document.getElementById('root')
            )

            return true
        })
}
