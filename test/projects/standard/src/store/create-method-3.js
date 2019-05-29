import { createStore, combineReducers, applyMiddleware } from 'redux';
import { reduxForCreateStore } from 'koot';
import reducers from './reducers';

/**
 * 项目自创建 store 的方法函数
 * - 提供创建 store 的方法
 * - 使用自定函数
 */
export default () => {
    const {
        reducers: defaultReducers,
        initialState,
        middlewares
    } = reduxForCreateStore;

    return createStore(
        combineReducers({
            ...defaultReducers,
            ...reducers
        }),
        initialState,
        applyMiddleware(...middlewares)
    );
};
