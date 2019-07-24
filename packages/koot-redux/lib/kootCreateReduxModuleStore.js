import { compose, applyMiddleware } from 'redux';
import { reduxForCreateStore } from 'koot';

import createReduxModuleStore from './createReduxModuleStore';
import { isObject } from './utils.js';

/**
 * 创建一个 redux-module-store, 并注入koot的依赖
 *
 * @param  {[type]} module         [description]
 * @param  {[type]} preloadedState [description]
 * @param  {[type]} enhancer       [description]
 * @return {[type]}                [description]
 */
export default function kootCreateReduxModuleStore(
    module,
    preloadedState,
    enhancer
) {
    // 处理传入参数
    if (
        typeof preloadedState === 'function' &&
        typeof enhancer === 'undefined'
    ) {
        enhancer = preloadedState;
        preloadedState = undefined;
    }

    // 判断 module 是否为 Object
    if (!isObject(module)) {
        throw new Error('Expected the module to be a Object.');
    }

    module.state = {
        ...module.state,
        ...reduxForCreateStore.reducers
    };

    if (enhancer) {
        enhancer = compose(
            applyMiddleware(...reduxForCreateStore.middlewares),
            enhancer
        );
    }

    return createReduxModuleStore(module, preloadedState, enhancer);
}
