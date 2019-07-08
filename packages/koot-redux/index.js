import { createStore, applyMiddleware, compose, bindActionCreators } from 'redux';
import ReduxModule from './lib/redux-module.js';
import { isObject } from './lib/utils.js';
import createActionMiddleware from './lib/action.middleware.js';

/**
 * 创建一个 redux-module-store
 * 
 * @param  {[type]} module         [description]
 * @param  {[type]} preloadedState [description]
 * @param  {[type]} enhancer       [description]
 * @return {[type]}                [description]
 */
const createReduxModuleStore = ( module, preloadedState, enhancer ) => {

    // 处理传入参数
    if( typeof preloadedState === 'function' && typeof enhancer === 'undefined' ) {
        enhancer = preloadedState;
        preloadedState = undefined;
    }

    // 判断 module 是否为 Object
    if( !isObject(module) ){
        throw new Error('Expected the module to be a Object.')
    }

    // 初始化
    // 将对应的数据模型 module 实例化为 reduxModule 对象
    const moduleInstance = new ReduxModule(module, 'root', preloadedState);
    // 拿到处理后的 rootReducer 函数
    const rootReducer = moduleInstance.createReducer();

    const actionMiddleware = createActionMiddleware(moduleInstance);
    const reduxModuleEnhancer = applyMiddleware(actionMiddleware)

    // 合并 enhancer 和 redux-module 集成 actionMiddleware
    if( enhancer !== undefined ){
        // compose 原有的 applyMiddleware 或者 enhancer
        // 并保证 actionMiddleware 在第一位
        enhancer = compose(
            reduxModuleEnhancer,
            enhancer
        )
    }else{
        enhancer = reduxModuleEnhancer;
    }

    // 创建原生 redux store
    // createStore(reducer, [preloadedState], enhancer)
    const store = createStore(
        rootReducer,
        preloadedState,
        enhancer
    );

    return store;
}

export {
    createReduxModuleStore,
    applyMiddleware,
    compose,
    bindActionCreators
}

