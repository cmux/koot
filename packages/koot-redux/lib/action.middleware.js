import { isObject, isString } from './utils.js';


const __STATIC_DATA__ = {};

/**
 * 从 action 中获取 name
 * @param  {[type]} _action [description]
 * @return {[type]}         [description]
 */
const getName = ( action ) => {
    if( isObject(action) ){
        return action.type;
    }
    if( isString(action) ){
        return action;
    }
    return null;
}

/**
 * 获取对象类型的 action 的 payload
 * @param  {[type]} _action [description]
 * @return {[type]}         [description]
 */
const getObjectActionPayload = ( action ) => {
    let payload = {};
    if( isObject(action) ){
        if( 'payload' in action ){
            payload = action.payload
        }else{
            let tempObject = Object.assign({}, action);
            delete tempObject.type;
            payload = tempObject;
        }
    }
    return payload;
}

const commitHandler = ( store ) => ( action, payload ) => {
    const reducerName = getName(action);

    const reducerFn = getReducerFnByName(reducerName);

    if( isObject(action) ){
        payload = getObjectActionPayload(action);
    }

    if( reducerFn ){
        store.dispatch({
            type: reducerName,
            payload,
            isModuleReducer: true,
        })
    }else{
        throw new Error(
            `The reducer function is not registered!`
        )
    }
}
    

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
        return __STATIC_DATA__['moduleInstance'].getStateByActionName(actionName) || {};
    }
    return actionFn({
        commit: commitHandler(store),
        rootState: Object.assign(store.getState()),
        state: getScopeState(),
        dispatch: store.dispatch,
    }, payload);
    // {
    //   state,      // same as `store.state`, or local state if in modules
    //   rootState,  // same as `store.state`, only in modules
    //   commit,     // same as `store.commit`
    //   dispatch,   // same as `store.dispatch`
    //   getters,    // same as `store.getters`, or local getters if in modules
    //   rootGetters // same as `store.getters`, only in modules
    // }
}

const getActionFnByName = ( actionName ) => {
    const actionCollection = __STATIC_DATA__['moduleInstance'].actionCollection;
    return actionCollection[actionName];
}

const getReducerFnByName = ( reducerName ) => {
    const reducerCollection = __STATIC_DATA__['moduleInstance'].reducerCollection;
    return reducerCollection[reducerName];
}

/**
 * actionMiddleware 创建函数
 * 
 * @param  {Object} moduleInstance [description]
 * @return {[type]}                [description]
 */
const createActionMiddleware = function( moduleInstance = {} ){

    __STATIC_DATA__['moduleInstance'] = moduleInstance;

    const actionCollection = moduleInstance.actionCollection;

    if( Object.keys(actionCollection).length === 0 ){
        throw new Error(
            `A valid actions collection was not received!`
        )
    }

    /**
     * 中间件主体函数
     * 
     * @param  {[type]} store [description]
     * @return {[type]}       [description]
     */
    const actionMiddleware = store => next => ( action, payload ) => {

        //  判断是否为对象形
        if( isObject(action) ){
            // 是否为 moduleRecuer
            const { isModuleReducer } = action;
            if( isModuleReducer ){
                delete action.isModuleReducer;
                next(action);
                return;
            }
            payload = getObjectActionPayload(action);
        }

        const actionName = getName(action);

        const actionFn = getActionFnByName(actionName);
        //  判断 moduleActon 是否存在
        if( actionFn ){
            return actionHandler({
                actionName,
                actionFn,
                store,
                payload
            })
        }else{
            next({
                type: actionName,
                payload
            });
            return;
        }
    }

    return actionMiddleware;
}

export default createActionMiddleware;
