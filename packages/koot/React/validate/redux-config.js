import { createStore, combineReducers, applyMiddleware } from 'redux'
import { reducers as defaultReducers, initialState, middlewares } from '../redux'

/**
 * 验证 Redux 配置
 * 
 * @async
 * @param {Object} kootConfigRedux Koot 配置项: `redux`
 * @returns {Object} reduxConfig
 */
export default async (kootConfigRedux = {}) => {

    const reduxConfig = {}

    if (typeof kootConfigRedux.store === 'undefined') {
        const { combineReducers: theReducers = {} } = kootConfigRedux
        Object.keys(defaultReducers).forEach(reducerName => {
            theReducers[reducerName] = defaultReducers[reducerName]
        })
        reduxConfig.factoryStore = () => {
            createStore(combineReducers(theReducers), initialState, applyMiddleware(...middlewares))
        }
    } else if (typeof kootConfigRedux.store === 'function') {
        reduxConfig.factoryStore = kootConfigRedux.store
    } else if (typeof kootConfigRedux.store === 'object') {
        reduxConfig.store = kootConfigRedux.store
    }

    return reduxConfig

}
