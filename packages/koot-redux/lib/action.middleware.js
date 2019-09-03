import { isObject, isString } from './utils.js';

const commitHandler = next => (action, payload, extra) => {
    if (isString(action)) {
        return next({
            type: action,
            payload,
            extra
        });
    }

    if (isObject(action) && action.type) {
        const { type, payload, ...extra } = action;
        return next({
            type,
            payload: payload || extra,
            extra
        });
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
    const actionMiddleware = api => next => (action, payload, ...extra) => {
        if (isString(action)) {
            const { getState, dispatch } = api;
            const actions = moduleInstance.getActionsByAction(action);
            const promiseArray = actions
                .map(({ actionFn, moduleState }) => {
                    return actionFn(
                        {
                            state: moduleState,
                            rootState: getState(),
                            commit: commitHandler(next),
                            dispatch
                        },
                        action,
                        payload,
                        extra
                    );
                })
                .filter(e => e);
            return Promise.all(promiseArray);
        }
        // 直接触发reducer
        if (isObject(action) && action.type) {
            const { type, payload, ...extra } = action;
            return next({
                type,
                payload: payload || extra,
                extra
            });
        }

        throw new Error(
            "dispatch first argument should be string or object: {type: 'string', ...}"
        );
    };

    return actionMiddleware;
};

export default createActionMiddleware;
