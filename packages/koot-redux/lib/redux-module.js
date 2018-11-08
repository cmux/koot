import { isFunction, isObject } from './utils.js';

/**
 * 模块化管理 redux
 * 
 */
class ReduxModule {

    constructor( module, moduleName ) {

        const { state, reducers, actions, modules } = module;
        // 存储初始化的module对象
        this.__module__ = module;
        // 存储 当前模块的  名称
        this.__moduleName = moduleName;
        // 存储 当前模块的  reducers 调用对象
        this.__reducers = reducers || {};
        // 存储 当前模块的  state 数据
        this.__state = state || {};
        // 存储 当前模块的  初始化state 数据
        this.__initState = state || {};
        // 存储 当前模块的  actions 调用对象
        this.__actions = actions || {};
        // 存储 当前模块的  子模块初始化module对象
        this.__modules = modules || {};
        // 存储 当前模块的  子模块实例化调用对象
        this.__children = {};
        // 存储 当前模块的  外部注入的 reducer 执行序列
        this.__external_reducers = this.getExternalModuleReducers( this.__state );

        // 实例化所有子模块并存储在 __children 下
        // this.__children[key] = new ReduxModule(this.__modules[key])
        if( Object.keys(this.__modules).length ){
            Object.keys(this.__modules).forEach(moduleName => {
                const moduleItem = this.__modules[moduleName];
                this.__children[moduleName] = new ReduxModule(moduleItem, moduleName);
            })
        }
    }

    /**
     * 获取当前 state 树上定义的外部注入进来的 reducer 集合
     * 
     * @param  {[type]} obj  [description]
     * @return {[Array]}     [外部注入进来的reducer的 “特殊对象” 集合]
     */
    getExternalModuleReducers( obj ) {
        const result = []
        Object.keys(obj).forEach(key => {
            const item = obj[key];
            const path = [];
            if( isFunction(item) ){
                path.push(key);
                result.push({
                    path,
                    reducer: item
                })
            }
            if( isObject(item) ){
                result.push(...this.getExternalModuleReducers(item));
            }
        })
        return result;
    }

    /**
     * 根据对象路径获取对应的值
     * 
     * @param  {[type]} obj  [description]
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    getDataByPath( obj, path ){
        let result = Object.assign({}, obj);
        path.forEach(p => {
            result = result[p]
            if( !result ){
                return null;
            }
        })
        return result;
    }

    /**
     * 根据对象路径设置对应的值
     * 
     * @param {[type]} obj   [description]
     * @param {[type]} path  [description]
     * @param {[type]} value [description]
     */
    setDataByPath( obj, path, value ){
        let result = Object.assign({}, obj);
        let reference = result;
        path.forEach((p, index) => {
            if( index === (path.length - 1)){
                reference[p] = value;
            }else{
                reference = reference[p]
            }
            if( !reference ){
                return null;
            }
        })
        return result;
    }

    /**
     * 外部引入reducers集合的统一调用函数
     * 
     * @param  {[type]} moduleState [description]
     * @param  {[type]} action      [description]
     * @return {[type]}             [description]
     */
    currentExternalReducerHandler( moduleState, action ) {
        const externalReducers = this.__external_reducers;
        let finalState;
        externalReducers.forEach(item => {
            const { path, reducer } = item;
            const currentState = this.getDataByPath(moduleState, path);
            const resultState = reducer(
                (isFunction(currentState) ? undefined : currentState),
                action
            );
            finalState = this.setDataByPath(moduleState, path, resultState)
            finalState = Object.assign({}, moduleState, finalState);
        })
        return finalState || moduleState;
    }

    /**
     * 根据 actionName 获取当前 module 的局部 state
     * 
     * @param  {[type]} actionName [description]
     * @return {[type]}            [description]
     */
    getStateByActionName( actionName ) {
        if( this.__actions[actionName] ){
            return this.__state;
        }else{
            const childrenModuleNames = Object.keys(this.__children);
            let result;
            if( childrenModuleNames.length ){
                childrenModuleNames.forEach(childrenModuleName => {
                    const childrenModuleItem = this.__children[childrenModuleName];
                    result = childrenModuleItem.getStateByActionName(actionName);
                })
            }
            return result;
        }
    }

    /**
     * 获取当前 module 及所有子 module 的所有的 reducer 的集合
     * 
     * @return {[type]} [description]
     */
    get reducerCollection() {
        let finalReducers = {};
        // 整合当前 modules 内 actions
        if( this.__reducers ){
            finalReducers = Object.assign({}, finalReducers, this.__reducers);
        }
        // 整合 children 内的 actions
        const childrenModuleNames = Object.keys(this.__children);
        if( childrenModuleNames.length ){
            let childrenActions = [];
            childrenModuleNames.forEach(childrenModuleName => {
                const childrenModuleItem = this.__children[childrenModuleName];
                childrenActions.push(childrenModuleItem.actionCollection);
            })
            // 合并最终全部 actions
            finalReducers = childrenActions.reduce((p, childrenAction) => {
                return {
                    ...p,
                    ...childrenAction
                }
            }, finalReducers)
        }
        return finalReducers;
    }

    /**
     * 获取当前 module 及所有子 module 的所有的 action 的集合
     * 
     * @return {[type]} [description]
     */
    get actionCollection() {
        let finalActions = {};
        // 整合当前 modules 内 actions
        if( this.__actions ){
            finalActions = Object.assign({}, finalActions, this.__actions);
        }
        // 整合 children 内的 actions
        const childrenModuleNames = Object.keys(this.__children);
        if( childrenModuleNames.length ){
            let childrenActions = [];
            childrenModuleNames.forEach(childrenModuleName => {
                const childrenModuleItem = this.__children[childrenModuleName];
                childrenActions.push(childrenModuleItem.actionCollection);
            })
            // 合并最终全部 actions
            finalActions = childrenActions.reduce((p, childrenAction) => {
                return {
                    ...p,
                    ...childrenAction
                }
            }, finalActions)
        }
        return finalActions;
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
        // moduleState 默认等于 初始化的state
        // 如果 执行一个不存在的 action.type 时，会按照默认值来初始化整个状态数
        return ( moduleState = this.__initState, action ) => {

            const { type, payload } = action;
            let finaState;
            
            // 执行当前 module 里引入的外部 reducer
            // 因为外部引入的 reducer 结果无法判断是否真正改变了
            // 不论执行结果如何都合并入 finaState 
            const externalStateResult = this.currentExternalReducerHandler(moduleState, action);
            // 合并结果至 最终的 状态数
            finaState = Object.assign({}, this.__state, moduleState, externalStateResult)
            // 同步至当前的 __state 
            this.__state = finaState;

            // 如果当前 module 的 reducer 存在则执行 并 同步结果
            const reducerHandler = this.__reducers[type];
            if( reducerHandler ){
                // 执行当前 module 的 reducer
                const moduleStateResult = reducerHandler(moduleState, payload);
                // 合并结果至 最终的 状态数
                finaState = Object.assign({}, this.__state, moduleState, finaState, moduleStateResult);
                this.__state = finaState;

            // 如果当前 module 的 reducer 不存在，
            // 将局部 state 和 action 传入给 子module的 createReducer 结果处理
            }else{
                // 把 action 和对应的 state 传给 子元素的 reducer
                const childrenModuleNames = Object.keys(this.__children);
                if( childrenModuleNames.length ){
                    let childrenFinalState = {};
                    childrenModuleNames.map(childrenModuleName => {
                        const childrenModuleItem = this.__children[childrenModuleName];
                        // 执行所有模块的 reducer
                        const result = childrenModuleItem.createReducer()(moduleState[childrenModuleName], action);
                        if( result !== moduleState[childrenModuleName] ){
                            childrenFinalState[childrenModuleName] = result;
                        }
                    })
                    // 这里不同步 子模块的执行结果至当前的局部 state 当中
                    finaState =  Object.assign({}, this.__state, moduleState, finaState, childrenFinalState);
                }
            }
            return finaState;
        }
    }
}

export default ReduxModule;
