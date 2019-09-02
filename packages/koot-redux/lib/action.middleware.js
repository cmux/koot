import { isObject, isString } from './utils.js';

// const __STATIC_DATA__ = {};

/**
 * 从 action 中获取 name
 * @param  {[type]} _action [description]
 * @return {[type]}         [description]
 */
const getName = action => {
    if (isObject(action)) {
        return action.type;
    }
    if (isString(action)) {
        return action;
    }
    return null;
};

/**
 * 获取对象类型的 action 的 payload
 * @param  {[type]} _action [description]
 * @return {[type]}         [description]
 */
const getPayload = action => {
    if ('payload' in action) {
        return action.payload;
    }
    const { type, ...rest } = action;
    return rest;
};

const commitHandler = (next, moduleInstance) => (action, payload) => {
    const reducerName = getName(action);
    const reducerFn = moduleInstance.reducerCollection[reducerName];

    if (isString(action)) {
        if (reducerFn) {
            return next({
                type: reducerName,
                payload
            });
        }
        throw new Error(
            `ActionMiddlewareError: The reducer function '${reducerName}' is not registered!`
        );
    }

    if (reducerFn) {
        return next({
            type: reducerName,
            payload: getPayload(action)
        });
    }

    return next(action);
};

/**
 * actionMiddleware 创建函数
 *
 * @param  {Object} moduleInstance [description]
 * @return {[type]}                [description]
 */
const createActionMiddleware = function(moduleInstance) {
    /**
     * 中间件主体函数
     *
     * @param  {[type]} store [description]
     * @return {[type]}       [description]
     */
    const actionMiddleware = api => next => (action, payload) => {
        if (isString(action)) {
            const actionName = getName(action);
            const actionFn = moduleInstance.actionCollection[actionName];
            const reducerFn = moduleInstance.reducerCollection[actionName];
            const { getState, dispatch } = api;
            if (actionFn) {
                return actionFn(
                    {
                        commit: commitHandler(next, moduleInstance),
                        rootState: getState(),
                        state: moduleInstance.getStateByActionName(actionName),
                        dispatch
                    },
                    payload
                );
            }
            if (reducerFn) {
                throw new Error(
                    `ActionMiddlewareError: You Must call the reducer '${actionName}' in a Action`
                );
            }
            throw new Error(
                `ActionMiddlewareError: The Action function '${actionName}' is not registered!`
            );
        }

        return next(action);
    };

    return actionMiddleware;
};

export default createActionMiddleware;
