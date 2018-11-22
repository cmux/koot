import { createStore, combineReducers, applyMiddleware } from 'redux'
import { reduxForCreateStore } from 'koot'

/**
 * 项目自创建 store 的方法函数
 */
export default () => {
    const {
        reducers, initialState, middlewares
    } = reduxForCreateStore

    return createStore(
        combineReducers(reducers),
        initialState,
        applyMiddleware(...middlewares)
    )
}
