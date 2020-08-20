import {
    Store,
    Middleware,
    Reducer,
    StoreEnhancer,
    ReducersMapObject
} from 'redux';

//

/** 创建 _Redux store_ */
export const createStore: (
    appReducer?: AppReducer,
    appMiddlewares?: AppMiddlewares,
    appEnhancers?: AppEnhancers
) => Store;

/** 项目使用的 reducer，可为 `Reducer` (reducer 函数)，也可以为 `ReducersMapObject` (形式为 Object 的列表) */
type AppReducer = Reducer | ReducersMapObject;
/** 项目的中间件列表 */
type AppMiddlewares = Array<Middleware>;
/** 项目的 store 增强函数 (enhancer) 列表 */
type AppEnhancers = Array<StoreEnhancer>;

//

export interface ReduxForCreateStore {
    readonly reducers: ReducersMapObject;
    readonly initialState: Object;
    readonly middlewares: Array<Middleware>;
}
/** 创建 _Redux store_ 时需要用到的内部数据 */
export const reduxForCreateStore: ReduxForCreateStore
