/// <reference path="../global.d.ts" />

import { ComponentType, ReactNode, FC, ComponentClass, Component } from 'react';
import { Store, Dispatch } from 'redux';
import { Connect } from 'react-redux';

export interface HOCExtend<ComponentProps> {
    /** React 高阶组件，可赋予目标组件CSS 命名空间、同构数据、更新页面信息等能力。 */
    <ComponentProps = {}>(options: extendOptions): ExtendComponent<
        ComponentProps
    >;
}
interface ExtendComponent<ComponentProps> {
    (WrappedComponent: FC<ComponentProps & ExtendedProps>): ComponentClass<
        ComponentProps & ExtendedProps
    >;

    <P extends ComponentProps>(
        WrappedComponent: ComponentType<P & ExtendedProps>
    ): HOC<ComponentProps & ExtendedProps>;
}
class HOC extends Component {}
export const extend: HOCExtend<ComponentProps>;

interface extendOptions {
    connect?: Connect;
    /** 提供页面的 title 和 meta 标签信息 */
    pageinfo?: extendPageinfoObject | extendPageinfoFunction;
    data?: extendDataFetch | extendData;
    styles?: KootComponentStyleObject;
    /**
     * 控制 SSR 行为
     * @default true
     */
    ssr?: ReactNode | boolean;
    /** 组件名 (仅供调试用) */
    name?: string;
}

interface extendPageinfoObject {
    title?: string;
    metas?: Array<extendPageinfoMeta>;
}

interface extendPageinfoMeta {
    [metaKey: string]: string;
}

function extendPageinfoFunction(
    state: any,
    props: P = Object
): extendPageinfoObject;

function extendDataFetch(
    store: Store,
    renderProps: RenderProps,
    dispatch: Dispatch
): Promise<any>;

function extendDataCheck<S = any, R = RenderProps>(
    state: S,
    renderProps: R
): boolean;

interface extendData {
    fetch?: extendDataFetch;
    check?: extendDataCheck;
}

//

/** extend 高阶组件向目标组件注入的 props */
export interface ExtendedProps {
    /** 包含父组件传入的 className 和 extend() 高阶组件注入的 className（如果在 extend 高阶组件中传入了 `styles` 属性）*/
    readonly className?: string;
    /** extend() 高阶组件注入的 className（如果在 extend 高阶组件中传入了 `styles` 属性）（排除父组件传入的 className）*/
    readonly 'data-class-name'?: string;
    /**
     * 可用来手动触发页面信息更新，语法与 connect() 高阶组件的 pageinfo 的函数用法相同
     * - 如果没有传入参数，会使用 `extend()` 高阶组件中的 `pageinfo` 的值
     * - 仅在 `extend()` 高阶组件中使用 `pageinfo` 属性时才会存在
     */
    readonly updatePageinfo?: ExtendedPropsUpdatePageinfo;
}

function ExtendedPropsUpdatePageinfo(
    newPageinfo?: extendPageinfoObject | extendPageinfoFunction
): void;

interface RenderProps {
    readonly location?: Object;
    readonly params?: Object;
    readonly route?: Object;
    readonly routeParams?: Object;
    readonly router?: Object;
    readonly routes?: Array<Object>;
}
