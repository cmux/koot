import { createReduxModuleStore, applyMiddleware } from 'koot-redux'
import { reduxForCreateStore } from 'koot'
import logger from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension'

import App from './modules/app.module'

const middlewares = [
    ...reduxForCreateStore.middlewares
]
if( __CLIENT__ && __DEV__ ){
    middlewares.push(logger)
}

/**
 * 创建 Redux store 的方法
 * 推荐: 使用 koot-redux 提供的方法进行封装
 */
const createStore = () => createReduxModuleStore(
    {
        state: {
            ...reduxForCreateStore.reducers
        },
        modules: {
            app: App,
        }
    },
    reduxForCreateStore.initialState,
    composeWithDevTools(applyMiddleware(middlewares))
)

export default createStore
