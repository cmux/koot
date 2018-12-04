import { routerReducer, routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'
import {
    reducer as realtimeLocationReducer,
    REALTIME_LOCATION_REDUCER_NAME,
} from './realtime-location'
import { SERVER_REDUCER_NAME, serverReducer } from '../ReactApp/server/redux'
import {
    reducerLocaleId as i18nReducerLocaleId,
    reducerLocales as i18nReducerLocales,
} from '../i18n/redux'
const getHistory = () => {
    if (__SPA__) {
        return require('react-router/lib/hashHistory')
    }
    return require('react-router/lib/browserHistory')
}

//

/**
 * @type {Array}
 */
export const reducers = {
    // 路由状态扩展
    'routing': routerReducer,
    // 目的：新页面请求处理完成后再改变URL
    [REALTIME_LOCATION_REDUCER_NAME]: realtimeLocationReducer,
    // 对应服务器生成的store
    [SERVER_REDUCER_NAME]: serverReducer,
}
if (JSON.parse(process.env.KOOT_I18N) || false) {
    reducers.localeId = i18nReducerLocaleId
    reducers.locales = i18nReducerLocales
}

//

/**
 * @type {Object}
 */
export let initialState = {}
if (__CLIENT__) initialState = window.__REDUX_STATE__

//

/**
 * @type {Array}
 */
export const middlewares = [
    thunk,
    routerMiddleware(getHistory()),
]
