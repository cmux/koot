import { ComponentType, ReactNode, FC, ComponentClass, Component } from 'react';
import { Store, Dispatch } from 'redux';
import { connect } from 'react-redux';

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
    [metaKey: string]: string;
}

interface kootComponentStyleObject {
    wrapper: string;
    css: string;
}

function extendPageinfoFunction<S = any>(
    state: S,
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
}

interface RenderProps {
    readonly location?: Object;
    readonly params?: Object;
    readonly route?: Object;
    readonly routeParams?: Object;
    readonly router?: Object;
    readonly routes?: Array<Object>;
}
