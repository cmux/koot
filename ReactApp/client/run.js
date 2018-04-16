import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import { routerMiddleware, routerReducer } from 'react-router-redux'

//

import { ReactApp } from 'super-project/ReactApp'
import { reducer as realtimeLocationReducer, REALTIME_LOCATION_REDUCER_NAME, actionUpdate } from 'sp-isomorphic-utils/realtime-location'
import {
    reducerLocaleId as i18nReducerLocaleId,
    reducerLocales as i18nReducerLocales,
    register as i18nRegister
} from 'sp-i18n'

//

import { SERVER_REDUCER_NAME, serverReducer } from '../server/redux'

const ROUTER_REDUCDER_NAME = 'routing'




export default ({
    i18n,
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
            afterRun,
            onRouterUpdate,
            onHistoryUpdate,
        } = client

        reactApp.react.router.ext({
            onUpdate: () => {
                // if (__DEV__) console.log('router onUpdate', self.__LATHPATHNAME__, location.pathname)
                if (typeof onRouterUpdate === 'function')
                    onRouterUpdate()
            }
        })

        if (i18n) i18nRegister(__REDUX_STATE__)

        let { beforeRun } = client
        if (typeof beforeRun === 'function') {
            beforeRun = new Promise(resolve => {
                beforeRun()
                    .then(() => resolve())
            })
        } else if (typeof beforeRun !== 'object' || typeof beforeRun.then !== 'function') {
            beforeRun = new Promise(resolve => resolve())
        }

        beforeRun.then(() =>
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

                    if (typeof onHistoryUpdate === 'function')
                        onHistoryUpdate(location, store)
                }
            })
        )
            .then(() => {
                if (typeof afterRun === 'function') afterRun()
            })
    }




    // ============================================================================
    // 结束
    // ============================================================================
    return reactApp
}
