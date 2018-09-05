import thunk from 'redux-thunk'
import { hydrate } from 'react-dom'
import BrowserRouter from 'react-router-dom/BrowserRouter'
import { renderRoutes } from 'react-router-config'
import {
    ConnectedRouter,
    routerReducer,
    routerMiddleware,
    // push
} from "react-router-redux"
import createHistory from "history/createBrowserHistory"

//

import { ReactApp } from '../index'
import {
    reducer as realtimeLocationReducer,
    REALTIME_LOCATION_REDUCER_NAME,
    actionUpdate
} from '../../React/realtime-location'
import {
    reducerLocaleId as i18nReducerLocaleId,
    reducerLocales as i18nReducerLocales,
} from '../../i18n/redux'
import i18nRegister from '../../i18n/register/isomorphic.client'
import convertRoutes from '../../utils/convert-routes'
import {
    setStore,
    setHistory,
    // setPageinfo,
} from '../../'
// import pageinfo from '../../React/pageinfo'

//

import { SERVER_REDUCER_NAME, serverReducer } from '../server/redux'
const ROUTER_REDUCDER_NAME = 'router'

let logCountRouterUpdate = 0
let logCountHistoryUpdate = 0
let store




export default ({
    i18n = JSON.parse(process.env.KOOT_I18N) || false,
    router,
    redux,
    client
}) => {
    // ============================================================================
    // React 初始化
    // ============================================================================

    const reactApp = new ReactApp({ rootDom: 'root' })

    reactApp.redux.middleware.use(thunk)
    // reactApp.redux.middleware.use(routerMiddleware(browserHistory))
    // const routerHistory = browserHistory
    // if (__CLIENT__) self.routerHistory = browserHistory




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
    reactApp.react.router.use(convertRoutes(router))




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

        const history = createHistory()
        reactApp.redux.middleware.use(routerMiddleware(history))

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

        const browserHistoryOnUpdate = (location, store) => {
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
        beforePromise.then(() => {
            // __REDUX_STATE__ 是与服务端约定好的存储redux数据对象 (在浏览器端的 html 里存在)
            this.createConfigureStoreFactory()
            store = this.configureStore(window.__REDUX_STATE__)

            // react-router
            history.listen(location => {
                // TODO:
                /*store.dispatch(realtimeLocationUpdate(location))
                if (typeof options.browserHistoryOnUpdate === 'function') 
                    options.browserHistoryOnUpdate(location)*/
                browserHistoryOnUpdate(location, store)
            })

            // 

            const routes = this.react.router.get()

            // 扩展 router 属性
            let ext = this.__reactRouterExt
            let root = this.rootDom

            // 设置常量
            setStore(store)
            setHistory(history)

            // 渲染
            hydrate(
                <Provider store={store}>
                    <BrowserRouter {...ext}>
                        {renderRoutes(routes)}
                    </BrowserRouter>
                </Provider>,
                document.getElementById(root)
            )

            return {
                history,
                store,
            }
        })
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
