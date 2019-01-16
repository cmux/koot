import { createStore, combineReducers, applyMiddleware } from 'redux'
import { reduxForCreateStore } from 'koot'
import logger from 'redux-logger'

const middlewares = [
    ...reduxForCreateStore.middlewares
]
if( __CLIENT__ && __DEV__ ){
    middlewares.push(logger)
}

/**
 * 创建 Redux store 的方法
 * 原则上支持任何与 `redux` 兼容的 store 对象
 * - 可使用 koot-redux 提供的方法进行封装
 */
export default () => {
    const {
        reducers: defaultReducers, initialState
    } = reduxForCreateStore

    return createStore(
        combineReducers({
            ...defaultReducers,
            // ...reducers
        }),
        initialState,
        applyMiddleware(...middlewares)
    )
}
