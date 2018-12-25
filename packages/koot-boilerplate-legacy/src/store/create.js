import { createStore, combineReducers, applyMiddleware } from 'redux'

import { reduxForCreateStore } from 'koot'
const {
    reducers: kootDefaultReducers, initialState, middlewares
} = reduxForCreateStore

import projectReducers from './reducers'

/**
 * 项目自创建 store 的方法
 */
export default () => createStore(
    combineReducers({
        ...kootDefaultReducers,
        ...projectReducers
    }),
    initialState,
    applyMiddleware(...middlewares)
)
