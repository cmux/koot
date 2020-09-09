import merge from 'lodash/merge';
import {
    createStore as reduxCreateStore,
    combineReducers as reduxCombineReducers,
    applyMiddleware as reduxApplyMiddleware,
    compose as reduxCompose,
} from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';

import { REDUXSTATE } from '../defaults/defines-window';

import {
    reducer as realtimeLocationReducer,
    REALTIME_LOCATION_REDUCER_NAME,
} from './realtime-location';
import { SERVER_REDUCER_NAME, serverReducer } from '../ReactApp/server/redux';

import {
    reducerLocaleId as i18nReducerLocaleId,
    // reducerLocales as i18nReducerLocales,
} from '../i18n/redux';
import isI18nEnabled from '../i18n/is-enabled';

// import history from "__KOOT_CLIENT_REQUIRE_HISTORY__"
import history from './history';
import { load as loadSessionStore } from './client-session-store';
// const getHistory = () => {
//     if (__SPA__) {
//         return require('react-router/lib/hashHistory')
//     }
//     return require('react-router/lib/browserHistory')
// }

/******************************************************************************
 *   ┌─┐┌─┐┌┐┌┌─┐┌┬┐┌─┐┌┐┌┌┬┐┌─┐
 *  │  │ ││││└─┐ │ ├─┤│││ │ └─┐
 * └─┘└─┘┘└┘└─┘ ┴ ┴ ┴┘└┘ ┴ └─┘
 *****************************************************************************/

export const RESET_CERTAIN_STATE = '@@KOOT@@RESET_CERTAIN_STATE';

/******************************************************************************
 *   ┌─┐┌─┐┌─┐┌─┐┌┐┌┌┬┐┬┌─┐┬  ┌─┐
 *  ├┤ └─┐└─┐├┤ │││ │ │├─┤│  └─┐
 * └─┘└─┘└─┘└─┘┘└┘ ┴ ┴┴ ┴┴─┘└─┘
 *****************************************************************************/

/**
 * @type {Array}
 */
export const reducers = {
    // 路由状态扩展
    routing: routerReducer,
    // history: __CLIENT__ ? () => history : () => '123',
    // 目的：新页面请求处理完成后再改变URL
    [REALTIME_LOCATION_REDUCER_NAME]: realtimeLocationReducer,
    // 对应服务器生成的store
    [SERVER_REDUCER_NAME]: serverReducer,
};
if (isI18nEnabled()) {
    reducers.localeId = i18nReducerLocaleId;
    // reducers.locales = i18nReducerLocales
}

/**
 * @type {Object}
 */
export const initialState = (() => {
    if (__CLIENT__) return merge(window[REDUXSTATE], loadSessionStore());
    if (__SERVER__) return {};
})();

/**
 * @type {Array}
 */
export const middlewares = [thunk, routerMiddleware(history)];

// const enhancerClientModifyState = createStore => (
//     reducer,
//     preloadedState,
//     enhancer
// ) => {
//     const store = createStore(reducer, preloadedState, enhancer);
//     console.log({ store, state: store.getState() });
//     return store;
// };

// const rootReducerClientResetCertainState = (state, action) => {
//     const reset = (data, prefix = '') => {
//         for (const [key, value] of Object.entries(data)) {
//             const newKey = prefix ? `${prefix}.${key}` : key;
//             if (
//                 typeof value === 'object' &&
//                 typeof state[key] === 'object' &&
//                 !Array.isArray(state[key])
//             ) {
//                 return reset(value, newKey);
//             } else if (value === true) {
//                 console.log(newKey);
//             }
//         }
//     };
//     if (
//         __CLIENT__ &&
//         action.type === RESET_CERTAIN_STATE &&
//         typeof action.data === 'object'
//     ) {
//         reset(action.data);
//     }
// };

/**
 * 创建 redux store
 * - _注_: 与 redux 提供的 `createStore` 方法略有不同，仅需提供项目所用的 reducer 对象和中间件列表，**不需要**初始 state 对象
 * @param {Object|Function} appReducers 项目使用的 reducer，可为 `ReducersMapObject` (形式为 Object 的列表)，也可以为 `Reducer` (reducer 函数)
 * @param {Function[]} appMiddlewares 项目的中间件列表
 * @param {Function[]} appEnhancers 项目的 store 增强函数 (enhancer) 列表
 * @returns {Object} redux store
 */
export const createStore = (
    appReducer,
    appMiddlewares = [],
    appEnhancers = []
) => {
    // const toCompose = [
    //     reduxApplyMiddleware(...middlewares.concat(appMiddlewares))
    // ];
    // if (__CLIENT__) toCompose.push(enhancerClientModifyState);

    const projectReducer = (() => {
        if (typeof appReducer === 'function') {
            const kootReducer = reduxCombineReducers({ ...reducers });
            return (state, action) => {
                const { appState, kootState } = sliceStateForReducers(state);
                return {
                    ...appReducer(appState, action),
                    ...kootReducer(kootState, action),
                };
            };
        } else if (
            typeof appReducer === 'object' &&
            !Array.isArray(appReducer)
        ) {
            return reduxCombineReducers({
                ...appReducer,
                ...reducers,
            });
        }

        return reduxCombineReducers({
            ...reducers,
        });
    })();

    if (!Array.isArray(appEnhancers) && appEnhancers)
        appEnhancers = [appEnhancers];
    else if (!appEnhancers) appEnhancers = [];

    return reduxCreateStore(
        projectReducer,
        initialState,
        reduxCompose(
            reduxApplyMiddleware(...middlewares.concat(appMiddlewares)),
            ...appEnhancers
        )
    );
};

/******************************************************************************
 *   ┬ ┬┌─┐┬  ┌─┐┌─┐┬─┐┌─┐
 *  ├─┤├┤ │  ├─┘├┤ ├┬┘└─┐
 * ┴ ┴└─┘┴─┘┴  └─┘┴└─└─┘
 *****************************************************************************/

/**
 * 将当前 state 拆分为 _appState_ 和 _kootState_
 * @param {Object} state
 * @returns {Object} { appState, kootState }
 */
const sliceStateForReducers = (state) => {
    const appState = {};
    const kootState = {};
    const keysForKootReducer = Object.keys(reducers);
    Object.keys(state).forEach((key) => {
        if (keysForKootReducer.includes(key)) {
            kootState[key] = state[key];
        } else {
            appState[key] = state[key];
        }
    });
    return {
        appState,
        kootState,
    };
};
