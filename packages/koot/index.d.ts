/// <reference path="global.d.ts" />

import { Component, FC, ComponentClass } from 'react';
import { Store, Dispatch } from 'redux';
import { connect } from 'react-redux';

declare module 'koot';

// @extend() ==================================================================

export const extend: (
    options: extendOptions
) => (
    component: ComponentClass<extendInjectedProps> | FC<extendInjectedProps>
) => Component;

interface extendOptions {
    connect?: connect;
    pageinfo?: extendPageinfoObject | extendPageinfoFunction;
    data?: extendDataFetch | extendData;
    styles?: kootComponentStyleObject;
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

interface extendInjectedProps {
    className?: string;
    'data-class-name'?: string;
    dispatch?: Dispatch;
}

interface renderProps {
    location?: Object;
    params?: Object;
    route?: Object;
    routeParams?: Object;
    router?: Object;
    routes?: Array<Object>;
}
