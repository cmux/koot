import {
    createStore as reduxCreateStore,
    combineReducers as reduxCombineReducers,
    applyMiddleware as reduxApplyMiddleware,
    compose as reduxCompose
} from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import {
    reducer as realtimeLocationReducer,
    REALTIME_LOCATION_REDUCER_NAME
} from './realtime-location';
import { SERVER_REDUCER_NAME, serverReducer } from '../ReactApp/server/redux';
import {
    reducerLocaleId as i18nReducerLocaleId
    // reducerLocales as i18nReducerLocales,
} from '../i18n/redux';
import isI18nEnabled from '../i18n/is-enabled';
// import history from "__KOOT_CLIENT_REQUIRE_HISTORY__"
import history from './history';
// const getHistory = () => {
//     if (__SPA__) {
//         return require('react-router/lib/hashHistory')
//     }
//     return require('react-router/lib/browserHistory')
// }

//

/**
 * @type {Array}
 */
export const reducers = {
    // 路由状态扩展
    routing: routerReducer,
    // 目的：新页面请求处理完成后再改变URL
    [REALTIME_LOCATION_REDUCER_NAME]: realtimeLocationReducer,
    // 对应服务器生成的store
    [SERVER_REDUCER_NAME]: serverReducer
};
if (isI18nEnabled()) {
    reducers.localeId = i18nReducerLocaleId;
    // reducers.locales = i18nReducerLocales
}

//

/**
 * @type {Object}
 */
export const initialState = (() => {
    if (__CLIENT__) return window.__REDUX_STATE__;
    if (__SERVER__) return {};
})();

//

/**
 * @type {Array}
 */
export const middlewares = [thunk, routerMiddleware(history)];

/**
 * 创建 redux store
 * - _注_: 与 redux 提供的 `createStore` 方法略有不同，仅需提供项目所用的 reducer 对象和中间件列表，**不需要**初始 state 对象
 * @param {Object} reducers 项目的 reducer 对象
 * @param {Array} middlewares 项目的中间件列表
 * @returns {Object} redux store
 */
export const createStore = (projectReducers = {}, projectMiddlewares = []) =>
    reduxCreateStore(
        reduxCombineReducers({
            ...projectReducers,
            ...reducers
        }),
        initialState,
        reduxCompose(
            reduxApplyMiddleware(...middlewares.concat(projectMiddlewares))
        )
    );
