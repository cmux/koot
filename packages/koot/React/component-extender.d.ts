/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

import {
    // ComponentType,
    ReactNode,
    FC,
    ComponentClass,
    Component,
    ComponentState,
    RefObject,
} from 'react';
import { Store, Dispatch } from 'redux';
import {
    MapStateToPropsParam,
    MapDispatchToPropsNonObject,
    MapDispatchToPropsParam,
    MergeProps,
    Options as ReactReduxOptions,
} from 'react-redux';

// ============================================================================

declare module 'kootExtendHOC';

// ============================================================================

interface ExtendComponent<P, S> {
    (wrappedComponent: FC<ExtendedProps & P>): ComponentClass<
        ExtendedProps & P
    >;
    (wrappedComponent: ComponentClass<any, any>): HOC<ExtendedProps & P, S>;
    // (wrappedComponent: FC<ExtendedProps & P>): ComponentClass<
    //     ExtendedProps & P
    // >;

    // (
    //     wrappedComponent:
    //         | FC<ExtendedProps & P>
    //         | ComponentClass
    //         | ComponentClass<ExtendedProps & P>
    // ): ComponentClass<ExtendedProps & P>;

    // (wrappedComponent: ComponentType<any>): HOC<ExtendedProps & P, S>;
    // (wrappedComponent: ComponentClass<any, any>): ComponentClass<
    //     JSX.LibraryManagedAttributes<wrappedComponent, P> & ExtendedProps & P,
    //     S
    // >;
}
class HOC extends Component {}

export function extend<P = {}, S = ComponentState>(options: {
    // connect?: Connect;
    connect?:
        | true
        | MapStateToPropsParam<any, P, S>
        | [null | undefined | MapStateToPropsParam<any, P, S>]
        | [
              null | undefined | MapStateToPropsParam<any, P, S>,
              (
                  | null
                  | undefined
                  | MapDispatchToPropsNonObject<any, P>
                  | MapDispatchToPropsParam<any, P>
              )
          ]
        | [
              null | undefined | MapStateToPropsParam<any, P, S>,
              (
                  | null
                  | undefined
                  | MapDispatchToPropsNonObject<any, P>
                  | MapDispatchToPropsParam<any, P>
              ),
              null | undefined | MergeProps<any, any, P, any>
          ]
        | [
              null | undefined | MapStateToPropsParam<any, P, S>,
              (
                  | null
                  | undefined
                  | MapDispatchToPropsNonObject<any, P>
                  | MapDispatchToPropsParam<any, P>
              ),
              null | undefined | MergeProps<any, any, P, any>,
              null | undefined | ReactReduxOptions<S, any, P>
          ];
    /** 提供页面的 title 和 meta 标签信息 */
    pageinfo?: Pageinfo | ExtendPageinfoFunction;
    data?: DataFetchFunction | ExtendData;
    styles?: KootComponentStyleObject;
    /**
     * 控制 SSR 行为
     * @default true
     */
    ssr?: ReactNode | boolean;
    /** 组件名 (仅供调试用) */
    name?: string;
}): ExtendComponent<P, S>;

export type Pageinfo = {
    /** 要设置的页面标题 */
    title?: string;
    /** 要设置的 `<meta>` 标签列表，需要元素为 `{[name]: value}` 对象的数组 */
    metas?: Array<MetaObject>;
};
export type MetaObject = {
    [metaKey: string]: string | undefined;
};

type ExtendPageinfoFunction = (state: any, props: any) => Pageinfo;

type DataFetchFunction = (
    store: Store,
    renderProps: any,
    dispatch: Dispatch
) => Promise<any>;

type DataCheckFunction = (state: any, renderProps: any) => boolean;

type ExtendData = {
    fetch?: DataFetchFunction;
    check?: DataCheckFunction;
};

//

/** extend 高阶组件向目标组件注入的 props */
export interface ExtendedProps {
    /** 包含父组件传入的 `className` 和 `extend()` 高阶组件注入的 `className`（如果在 `extend()` 高阶组件中传入了 `styles` 属性）*/
    className?: string;
    /**
     * `extend()` 高阶组件注入的 `className`
     * - 不包含父组件传入的 `className`
     * - 仅在 `extend()` 高阶组件中传入了 `styles` 属性时才会存在
     */
    readonly 'data-class-name'?: string;
    /**
     * 可用来手动触发页面信息更新，语法与 `connect()` 高阶组件的 `pageinfo` 的函数用法相同
     * - 如果没有传入参数，会使用 `extend()` 高阶组件中的 `pageinfo` 的值
     * - 仅在 `extend()` 高阶组件中使用 `pageinfo` 属性时才会存在
     */
    readonly updatePageinfo?: ExtendedPropsUpdatePageinfo;
    readonly forwardedRef?: RefObject<any>;
}
type ExtendedPropsUpdatePageinfo = (
    newPageinfo?: Pageinfo | ExtendPageinfoFunction
) => void;

interface RenderProps extends ExtendedProps {
    readonly location?: Record<string, any>;
    readonly params?: Record<string, any>;
    readonly route?: Record<string, any>;
    readonly routeParams?: Record<string, any>;
    readonly router?: Record<string, any>;
    readonly routes?: Array<Record<string, any>>;
}
