import { isObject, isString } from './utils.js';

const __STATIC_DATA__ = {};

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
const getObjectActionPayload = action => {
    let payload = {};
    if (isObject(action)) {
        if ('payload' in action) {
            payload = action.payload;
        } else {
            let tempObject = Object.assign({}, action);
            delete tempObject.type;
            payload = tempObject;
        }
    }
    return payload;
};

const commitHandler = store => (action, payload) => {
    const reducerName = getName(action);
    const reducerFn = getReducerFnByName(reducerName);

    if (isObject(action)) {
        payload = getObjectActionPayload(action);
    }

    if (reducerFn) {
        store.dispatch({
            type: reducerName,
            payload,
            isModuleReducer: true
        });
    } else {
        throw new Error(
            `ActionMiddlewareError: The reducer function '${reducerName}' is not registered!`
        );
    }
};

/**
 * Action的执行处理函数
 *
 * @param  {[type]} options.actionName [description]
 * @param  {[type]} options.actionFn   [description]
 * @param  {[type]} options.store      [description]
 * @param  {[type]} options.payload    [description]
 * @return {[type]}                    [description]
 */
const actionHandler = ({ actionName, actionFn, store, payload }) => {
    const getScopeState = () => {
        return (
            __STATIC_DATA__['moduleInstance'].getStateByActionName(
                actionName
            ) || {}
        );
    };
    return actionFn(
        {
            commit: commitHandler(store),
            rootState: Object.assign(store.getState()),
            state: getScopeState(),
            dispatch: store.dispatch
        },
        payload
    );
    // {
    //   state,      // same as `store.state`, or local state if in modules
    //   rootState,  // same as `store.state`, only in modules
    //   commit,     // same as `store.commit`
    //   dispatch,   // same as `store.dispatch`
    //   getters,    // same as `store.getters`, or local getters if in modules
    //   rootGetters // same as `store.getters`, only in modules
    // }
};

const getActionFnByName = actionName => {
    const actionCollection = __STATIC_DATA__['moduleInstance'].actionCollection;
    return actionCollection[actionName];
};

const getReducerFnByName = reducerName => {
    const reducerCollection =
        __STATIC_DATA__['moduleInstance'].reducerCollection;
    return reducerCollection[reducerName];
};

/**
 * actionMiddleware 创建函数
 *
 * @param  {Object} moduleInstance [description]
 * @return {[type]}                [description]
 */
const createActionMiddleware = function(moduleInstance = {}) {
    __STATIC_DATA__['moduleInstance'] = moduleInstance;

    // const actionCollection = moduleInstance.actionCollection;

    // if( Object.keys(actionCollection).length === 0 ){
    //     throw new Error(
    //         `A valid actions collection was not received!`
    //     )
    // }

    /**
     * 中间件主体函数
     *
     * @param  {[type]} store [description]
     * @return {[type]}       [description]
     */
    const actionMiddleware = store => next => (action, payload) => {
        const actionName = getName(action);

        const actionFn = getActionFnByName(actionName);

        // 判断 是否为我们定义的 action
        if (actionFn) {
            // 判断 是否为传统对象形式参数
            if (isObject(action)) {
                const { isModuleReducer } = action;
                if (isModuleReducer) {
                    delete action.isModuleReducer;
                    next(action);
                    return;
                }
                payload = getObjectActionPayload(action);
                next({
                    type: actionName,
                    payload
                });
                return;
            } else {
                return actionHandler({
                    actionName,
                    actionFn,
                    store,
                    payload
                });
            }
        } else {
            // 不是我们的 action 且为传统 action 对象
            if (isObject(action)) {
                const { isModuleReducer } = action;
                if (isModuleReducer) {
                    delete action.isModuleReducer;
                    next(action);
                    return;
                }
                // 检查是否为我们的reducers
                const reducer = getReducerFnByName(actionName);
                if (reducer) {
                    throw new Error(
                        `ActionMiddlewareError: You Must call the reducer '${actionName}' in a Action`
                    );
                }
                next(action);
                return;
            } else {
                throw new Error(
                    `ActionMiddlewareError: The Action function '${actionName}' is not registered!`
                );
            }
        }
    };

    return actionMiddleware;
};

export default createActionMiddleware;
