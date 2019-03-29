import { createStore, combineReducers, applyMiddleware } from 'redux'
import { reduxForCreateStore } from 'koot'

const middlewares = [
    ...reduxForCreateStore.middlewares
]
if (__CLIENT__ && __DEV__) {
    middlewares.push(require('redux-logger').default)
}

/**
 * 创建 Redux store 的方法
 * 原则上支持任何与 `redux` 兼容的 store 对象
 * - 可使用 koot-redux 提供的方法进行封装
 * 
 * 本例为 Redux 最基本的写法
 */
export default () => {
    const {
        reducers: defaultReducers, initialState
    } = reduxForCreateStore

    return createStore(
        combineReducers({
            ...defaultReducers,
            // 这里添加项目中使用的 reducer
        }),
        initialState,
        applyMiddleware(...middlewares)
    )
}
