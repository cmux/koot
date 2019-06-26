/// <reference path="global.d.ts" />

import { Component, FC, ComponentClass, Element } from 'react';
import { Store, Dispatch } from 'redux';
import { connect } from 'react-redux';

declare module 'koot';

// @extend() ==================================================================

/** React 高阶组件，可赋予目标组件CSS 命名空间、同构数据、更新页面信息等能力。 */
export const extend: (
    options: extendOptions
) => (component: ComponentClass | FC<extendInjectedProps>) => ComponentClass;

interface extendOptions {
    connect?: connect;
    /** 提供页面的 title 和 meta 标签信息 */
    pageinfo?: extendPageinfoObject | extendPageinfoFunction;
    data?: extendDataFetch | extendData;
    styles?: kootComponentStyleObject;
    /** 控制 SSR 行为 */
    ssr?: ComponentClass | Component | Element | FC | boolean;
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
interface extendInjectedProps {
    className?: string;
    'data-class-name'?: string;
    /** Redux store 提供的 dispatch() 函数 */
    dispatch: Dispatch;
}

interface renderProps {
    location?: Object;
    params?: Object;
    route?: Object;
    routeParams?: Object;
    router?: Object;
    routes?: Array<Object>;
}
