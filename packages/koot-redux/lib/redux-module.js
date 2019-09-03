import { isFunction, isObject, getDataByPath, setDataByPath } from './utils.js';

/**
 * 模块化管理 redux
 *
 */
class ReduxModule {
    constructor(module, moduleName, preloadedState) {
        const { state, reducers, actions, modules } = module;
        //
        this.__module__ = module;
        //
        this.__moduleName = moduleName;
        //
        this.__reducers = reducers || {};
        //
        this.__state = state || {};
        //
        this.__initState = state || {};
        //
        this.__actions = actions || {};
        //
        this.__modules = modules || {};
        //
        this.__children = {};
        //
        this.__external_reducers = this.getExternalModuleReducers(this.__state);

        this.initState(preloadedState);
    }

    initState(preloadedState) {
        const modules = this.__modules;
        // 合并preloadedState到state
        if (preloadedState) {
            Object.keys(preloadedState).forEach(itemKey => {
                if (!modules || !modules[itemKey]) {
                    this.__state[itemKey] = preloadedState[itemKey];
                }
            });
        }

        // 实例化所有子模块并存储在 __children 下
        // this.__children[key] = new ReduxModule(modules[key])
        if (Object.keys(modules).length) {
            Object.keys(modules).forEach(moduleName => {
                const moduleItem = modules[moduleName];
                let preloadedStateItem;
                if (preloadedState && preloadedState[moduleName]) {
                    preloadedStateItem = preloadedState[moduleName];
                }
                this.__children[moduleName] = new ReduxModule(
                    moduleItem,
                    moduleName,
                    preloadedStateItem
                );
            });
        }
    }

    /**
     * 处理当前 state 树上定义的外部注入进来的 reducer
     *
     * @param  {[type]} obj  [description]
     * @return {[Array]}     [外部注入进来的reducer的 “特殊对象” 集合]
     */
    getExternalModuleReducers(obj) {
        let result = [];
        Object.keys(obj).forEach(key => {
            const item = obj[key];
            const path = [];
            if (isFunction(item)) {
                path.push(key);
                result.push({
                    path,
                    reducer: item
                });
            }
            if (isObject(item)) {
                const res = this.getExternalModuleReducers(item);
                result = result.concat(res);
            }
        });
        return result;
    }

    /**
     * [currentExternalReducerHandler description]
     *
     * @param  {[type]} moduleState [description]
     * @param  {[type]} action      [description]
     * @return {[type]}             [description]
     */
    currentExternalReducerHandler(moduleState, action) {
        const externalReducers = this.__external_reducers;
        let finalState = moduleState || {};
        externalReducers.forEach(item => {
            const { path, reducer } = item;
            const currentState = getDataByPath(finalState, path);
            const resultState = reducer(
                isFunction(currentState) ? undefined : currentState,
                action
            );
            const resultModuleState = setDataByPath(
                finalState,
                path,
                resultState
            );
            finalState = {
                ...finalState,
                ...resultModuleState
            };
        });
        return finalState;
    }

    getActionsByAction(action) {
        let result = [];
        if (this.__actions && this.__actions[action]) {
            result.push({
                actionFn: this.__actions[action],
                moduleState: this.__state
            });
        }
        const childrenModuleNames = Object.keys(this.__children);
        if (childrenModuleNames.length) {
            childrenModuleNames.forEach(name => {
                const res = this.__children[name].getActionsByAction(action);
                result = result.concat(res);
            });
        }
        return result;
    }

    /**
     * 当前类 reducer 的创建函数
     *
     * 函数内为当前 module 的局部 state
     * 形式如下：
     *  ( moduleState, action ) => ( newModuleState )
     *
     * @return {[type]} [description]
     */
    createReducer() {
        return (moduleState = this.__initState, action) => {
            const { type, payload } = action;
            const reducerHandler = this.__reducers[type];
            let finalState;

            if (reducerHandler) {
                // 执行当前 module 的 reducer
                const moduleStateResult = reducerHandler(moduleState, payload);
                finalState = { ...moduleStateResult };
                this.__state = finalState;
            } else {
                // 把 action 和对应的 state 传给 子元素的 reducer
                const childrenModuleNames = Object.keys(this.__children);
                if (childrenModuleNames.length) {
                    let childrenFinalState;
                    childrenModuleNames.forEach(childrenModuleName => {
                        const childrenModuleItem = this.__children[
                            childrenModuleName
                        ];
                        // 执行所有模块的 reducer
                        const result = childrenModuleItem.createReducer()(
                            moduleState[childrenModuleName],
                            action
                        );
                        if (result !== moduleState[childrenModuleName]) {
                            if (!childrenFinalState) {
                                childrenFinalState = {};
                            }
                            childrenFinalState[childrenModuleName] = result;
                        }
                    });
                    finalState = {
                        ...moduleState,
                        ...childrenFinalState
                    };
                }
            }

            // 执行当前 module 里引入的外部 reducer
            // 不论执行结果如何都合并入 finalState
            if (
                this.__external_reducers &&
                this.__external_reducers.length > 0
            ) {
                const externalStateResult = this.currentExternalReducerHandler(
                    this.__state,
                    action
                );
                finalState = {
                    ...finalState,
                    ...externalStateResult
                };
                this.__state = {
                    ...this.__state,
                    ...externalStateResult
                };
            }

            return finalState || moduleState;
        };
    }
}

export default ReduxModule;
