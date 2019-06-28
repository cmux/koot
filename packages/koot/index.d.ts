/// <reference path="global.d.ts" />

import { ComponentType, ReactNode, Component } from 'react';
import { Store, Dispatch } from 'redux';
import { connect } from 'react-redux';

declare module 'koot';

// @extend() ==================================================================

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

//
