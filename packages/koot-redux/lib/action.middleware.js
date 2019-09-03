import { isObject, isString } from './utils.js';

const commitHandler = next => (action, payload) => {
    if (isString(action)) {
        return next({
            type: action,
            payload
        });
    }

    if (isObject(action) && action.type) {
        return next(action);
    }

    throw new Error(
        "commit first argument should be string or object: {type: 'string', ...}"
    );
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
            const { getState, dispatch } = api;
            const actions = moduleInstance.getActionsByAction(action);
            const promiseArray = actions.map(({ actionFn, moduleState }) => {
                const commitAPI = {
                    state: moduleState,
                    rootState: getState(),
                    commit: commitHandler(next),
                    dispatch
                };
                const res = actionFn(commitAPI, payload);
                return Promise.resolve(res);
            });
            if (promiseArray.length === 1) {
                return promiseArray[0];
            }
            return Promise.all(promiseArray);
        }
        // 直接触发reducer
        if (isObject(action) && action.type) {
            return next(action);
        }

        throw new Error(
            "dispatch first argument should be string or object: {type: 'string', ...}"
        );
    };

    return actionMiddleware;
};

export default createActionMiddleware;
