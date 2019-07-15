/// <reference path="global.d.ts" />

import { ComponentType, ReactNode, Component } from 'react';
import {
    Store,
    Dispatch,
    Middleware,
    Reducer,
    StoreEnhancer,
    ReducersMapObject
} from 'redux';
import { connect } from 'react-redux';

declare module 'koot';

// general informations =======================================================

/** 获取当前请求对应到项目的语种ID */
export const getLocaleId: () => LocaleId;
/** 当前请求对应到项目的语种ID */
type LocaleId = string;

/** 获取 _Redux store_ 对象 */
export const getStore: () => Store;

/** 获取封装后的 History 对象 */
export const getHistory: () => Object;

/**
 * 获取公用缓存空间
 * - 如果 `localeId` 为 `true`，返回对应当前语种的独立对象
 * - 如果 `localeId` 为 string，返回对应语种的独立对象
 * - 默认返回公用对象
 *
 * ---
 *
 * - _客户端_: 返回 `window` 上的一个对象
 * - _服务器端_: 在 session 间共享的对象，服务器启动时创建
 *
 * ---
 *
 * ! 注1 ! 客户端与服务器端的结果不同，在编写同构逻辑时请注意
 *
 * ! 注2 ! 公用对象空间内不包含对应语种的对象，需要对应语种的结果时需要提供 `localeId`
 */
export const getCache: (localeId?: LocaleId | boolean) => Object;

// HOC extend() ===============================================================

export interface HOCExtend {
    /** React 高阶组件，可赋予目标组件CSS 命名空间、同构数据、更新页面信息等能力。 */
    (options: extendOptions): (
        WrappedComponent: ComponentType<ExtendedProps>
    ) => HOC<ExternalProps>;
}
class HOC extends Component {}
export const extend: HOCExtend;

interface extendOptions {
    connect?: connect;
    /** 提供页面的 title 和 meta 标签信息 */
    pageinfo?: extendPageinfoObject | extendPageinfoFunction;
    data?: extendDataFetch | extendData;
    styles?: kootComponentStyleObject;
    /**
     * 控制 SSR 行为
     * @default true
     */
    ssr?: ReactNode | boolean;
}

interface extendPageinfoObject {
    title?: string;
    metas?: Array<extendPageinfoMeta>;
}

interface extendPageinfoMeta {
    [metaKey: String]: string;
}

interface kootComponentStyleObject {
    wrapper: string;
    css: string;
}

type extendPageinfoFunction = (
    state: S = any,
    props: P = Object
) => extendPageinfoObject;

type extendDataFetch = (
    store: Store,
    renderProps: renderProps,
    dispatch: Dispatch
) => Promise<any>;

type extendDataCheck = (state: S = any, renderProps: renderProps) => Boolean;

interface extendData {
    fetch?: extendDataFetch;
    check?: extendDataCheck;
}

/** extend 高阶组件向目标组件注入的 props */
export interface ExtendedProps {
    className?: string;
    /** 排除父组件传入的 className 后 extend 高阶组件注入的 className（如果在 extend 高阶组件中传入了 `styles` 属性）*/
    'data-class-name'?: string;
}

interface renderProps {
    location?: Object;
    params?: Object;
    route?: Object;
    routeParams?: Object;
    router?: Object;
    routes?: Array<Object>;
}

// for creating store =========================================================

/** 创建 _Redux store_ */
export const createStore: (
    appReducer?: AppReducer,
    appMiddlewares?: AppMiddlewares,
    appEnhancers?: Array<StoreEnhancer>
) => Store;

/** 项目使用的 reducer，可为 `Reducer` (reducer 函数)，也可以为 `ReducersMapObject` (形式为 Object 的列表) */
type AppReducer = Reducer | ReducersMapObject;
/** 项目的中间件列表 */
type AppMiddlewares = Array<Middleware>;
/** 项目的 store 增强函数 (enhancer) 列表 */
type AppEnhancers = Array<StoreEnhancer>;

/** 创建 _Redux store_ 时需要用到的内部数据 */
export interface reduxForCreateStore {
    reducers: ReducersMapObject;
    initialState: Object;
    middlewares: Array<Middleware>;
}
