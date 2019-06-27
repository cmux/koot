/// <reference path="global.d.ts" />

import { ComponentClass, ComponentType, ReactNode } from 'react';
import { Store, Dispatch } from 'redux';
import { connect } from 'react-redux';

declare module 'koot';

// @extend() ==================================================================

/** React 高阶组件，可赋予目标组件CSS 命名空间、同构数据、更新页面信息等能力。 */
export const extend: (
    options: extendOptions
) => <C extends ComponentType<ExtendInjectedProps>>(
    component: ComponentType<ExtendInjectedProps>
) => ConnectedComponentClass<component, ExtendInjectedProps>;

// export function extend(options: extendOptions) {
//     return function extendEnhancer<
//         C extends ComponentClass<ExtendInjectedProps>
//     >(Component: ComponentType<ExtendInjectedProps>): C {
//         return Component;
//     };
// }
// export function extendEnhancer(Component: ComponentType<ExtendInjectedProps>) {
//     return Component;
// }

interface extendOptions {
    connect?: connect;
    /** 提供页面的 title 和 meta 标签信息 */
    pageinfo?: extendPageinfoObject | extendPageinfoFunction;
    data?: extendDataFetch | extendData;
    styles?: kootComponentStyleObject;
    /** 控制 SSR 行为 */
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
interface ExtendInjectedProps extends P {
    className?: string;
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

// Omit taken from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * A property P will be present if:
 * - it is present in DecorationTargetProps
 *
 * Its value will be dependent on the following conditions
 * - if property P is present in InjectedProps and its definition extends the definition
 *   in DecorationTargetProps, then its definition will be that of DecorationTargetProps[P]
 * - if property P is not present in InjectedProps then its definition will be that of
 *   DecorationTargetProps[P]
 * - if property P is present in InjectedProps but does not extend the
 *   DecorationTargetProps[P] definition, its definition will be that of InjectedProps[P]
 */
export type Matching<InjectedProps, DecorationTargetProps> = {
    [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
        ? InjectedProps[P] extends DecorationTargetProps[P]
            ? DecorationTargetProps[P]
            : InjectedProps[P]
        : DecorationTargetProps[P];
};

/**
 * a property P will be present if :
 * - it is present in both DecorationTargetProps and InjectedProps
 * - InjectedProps[P] can satisfy DecorationTargetProps[P]
 * ie: decorated component can accept more types than decorator is injecting
 *
 * For decoration, inject props or ownProps are all optionally
 * required by the decorated (right hand side) component.
 * But any property required by the decorated component must be satisfied by the injected property.
 */
export type Shared<
    InjectedProps,
    DecorationTargetProps extends Shared<InjectedProps, DecorationTargetProps>
> = {
    [P in Extract<
        keyof InjectedProps,
        keyof DecorationTargetProps
    >]?: InjectedProps[P] extends DecorationTargetProps[P]
        ? DecorationTargetProps[P]
        : never;
};

// Infers prop type from component C
export type GetProps<C> = C extends ComponentType<infer P> ? P : never;

// Applies LibraryManagedAttributes (proper handling of defaultProps
// and propTypes), as well as defines WrappedComponent.
export type ConnectedComponentClass<C, P> = ComponentClass<
    JSX.LibraryManagedAttributes<C, P>
>;
