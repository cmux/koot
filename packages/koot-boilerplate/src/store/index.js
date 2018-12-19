import { createReduxModuleStore, applyMiddleware } from 'koot-redux';

import { reduxForCreateStore } from 'koot';

import rootModule from './modules';

import { composeWithDevTools } from 'redux-devtools-extension';

const middlewareList = [
    ...reduxForCreateStore.middlewares
]

// 创建store实例
const store = createReduxModuleStore(
    rootModule,
    typeof window !== 'undefined' ? window.__REDUX_STATE__ : undefined,
    composeWithDevTools(
        applyMiddleware(
            ...middlewareList
        )
    )
)

export const dispatch = store.dispatch;

export const getState = store.getState;

export const subscribe = store.subscribe;

export const replaceReducer = store.replaceReducer;

export default store;