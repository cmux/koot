import { createStore, combineReducers, applyMiddleware } from 'redux';
import {
    reducers as defaultReducers,
    initialState,
    middlewares,
} from '../redux';
// import filterState from '../../libs/filter-state';

/**
 * 验证 Redux 配置
 *
 * @param {Object} kootConfigRedux Koot 配置项: `redux`
 * @returns {Object} reduxConfig
 */
const validateReduxConfig = (kootConfigRedux = {}) => {
    const { syncCookie = true } = kootConfigRedux;
    const reduxConfig = {
        syncCookie,
    };

    if (typeof kootConfigRedux.store === 'undefined') {
        const { combineReducers: theReducers = {} } = kootConfigRedux;
        Object.keys(defaultReducers).forEach((reducerName) => {
            theReducers[reducerName] = defaultReducers[reducerName];
        });
        // console.log({ theReducers, initialState });
        // const theInitialState = filterState({ ...initialState });
        // console.log({ initialState, theInitialState });
        reduxConfig.factoryStore = () =>
            createStore(
                combineReducers(theReducers),
                // theInitialState,
                initialState,
                applyMiddleware(...middlewares)
            );
    } else if (typeof kootConfigRedux.store === 'function') {
        reduxConfig.factoryStore = kootConfigRedux.store;
    } else if (typeof kootConfigRedux.store === 'object') {
        reduxConfig.store = kootConfigRedux.store;
    }

    return reduxConfig;
};

export default validateReduxConfig;
