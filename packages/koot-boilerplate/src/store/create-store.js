import { createReduxModuleStore, applyMiddleware } from 'koot-redux';

import { reduxForCreateStore } from 'koot';

import logger from 'redux-logger';

import rootModule from './modules';

const middlewareList = [
    ...reduxForCreateStore.middlewares
]

if( __CLIENT__ && __DEV__ ){
    middlewareList.push(logger)
}

const createStore = () => {
    const store = createReduxModuleStore(
        rootModule,
        typeof window !== 'undefined' ? window.__REDUX_STATE__ : undefined,
        applyMiddleware(
            ...middlewareList
        )
    )
    return store;
}

export default createStore;
