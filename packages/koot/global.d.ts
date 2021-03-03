/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
import { LocationShape } from 'react-router/lib/PropTypes';

// ============================================================================

/** 当前是否为客户端 */
declare const __CLIENT__: boolean;
/** 当前是否为服务器端 */
declare const __SERVER__: boolean;
/** 当前是否为开发环境 */
declare const __DEV__: boolean;
/** 当前是否为 SPA 模式 */
declare const __SPA__: boolean;

// ============================================================================

interface TranslateReplaces {
    [key: string]: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateResult = any;
// type TranslateResultArray = Array<string | TranslateResultObject>;
// type TranslateResultObject = {
//     [key: string]: TranslateResult;
// };

/** 多语言翻译函数 */
declare function __(...keys: string[]): TranslateResult;
declare function __(key: string, replaces: TranslateReplaces): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    key6: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    key6: string,
    key7: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    key6: string,
    key7: string,
    key8: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    key6: string,
    key7: string,
    key8: string,
    key9: string,
    replaces: TranslateReplaces
): TranslateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    key6: string,
    key7: string,
    key8: string,
    key9: string,
    key10: string,
    replaces: TranslateReplaces
): TranslateResult;

// ============================================================================

declare interface KootModularStyleObject {
    /**
     * 组件 ID，也即 `className`
     * - 仅为本组件 CSS 的 `className`，不包含父组件通过 `props` 传入的
     */
    wrapper: string;
    /**
     * 组件 CSS 代码内容
     */
    css: string;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.module.css' {
    const kootComponentStyleCSS: KootModularStyleObject;
    export = kootComponentStyleCSS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.component.css' {
    const kootComponentStyleCSS: KootModularStyleObject;
    export = kootComponentStyleCSS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.view.css' {
    const kootComponentStyleCSS: KootModularStyleObject;
    export = kootComponentStyleCSS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.module.sass' {
    const kootComponentStyleSASS: KootModularStyleObject;
    export = kootComponentStyleSASS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.component.sass' {
    const kootComponentStyleSASS: KootModularStyleObject;
    export = kootComponentStyleSASS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.view.sass' {
    const kootComponentStyleSASS: KootModularStyleObject;
    export = kootComponentStyleSASS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.module.scss' {
    const kootComponentStyleSCSS: KootModularStyleObject;
    export = kootComponentStyleSCSS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.component.scss' {
    const kootComponentStyleSCSS: KootModularStyleObject;
    export = kootComponentStyleSCSS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.view.scss' {
    const kootComponentStyleSCSS: KootModularStyleObject;
    export = kootComponentStyleSCSS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.module.less' {
    const kootComponentStyleLESS: KootModularStyleObject;
    export = kootComponentStyleLESS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.component.less' {
    const kootComponentStyleLESS: KootModularStyleObject;
    export = kootComponentStyleLESS;
}
/** _Koot.js_ 组件 CSS 对象 */
declare module '*.view.less' {
    const kootComponentStyleLESS: KootModularStyleObject;
    export = kootComponentStyleLESS;
}

// ============================================================================

declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * 项目模式
         * - isomorphic - 同构/SSR 项目
         * - spa - 单页应用 (Single-Page App)
         * - static - 静态化站点 (❌尚未启用)
         */
        WEBPACK_BUILD_TYPE: 'isomorphic' | 'spa' | 'static';
        /**
         * 当前打包场景或运行时
         * - client - 客户端/浏览器端
         * - server - 服务器端
         */
        WEBPACK_BUILD_STAGE: 'client' | 'server';
        /**
         * 当前环境
         * - prod - 生产环境
         * - dev - 开发环境
         */
        WEBPACK_BUILD_ENV: 'prod' | 'dev';
        /**
         * 项目类型
         * - ReactApp - React 同构/SSR
         *     - serverless 属于 ReactApp
         * - ReactSPA - React SPA
         */
        KOOT_PROJECT_TYPE: 'ReactApp' | 'ReactSPA' | 'ReactElectronSPA';
        /** EJS 模板内容 */
        KOOT_HTML_TEMPLATE: string;
        /**
        'KOOT_VERSION',
        'KOOT_PROJECT_NAME',
        'KOOT_DIST_DIR',
        'KOOT_I18N',
        'KOOT_I18N_TYPE',
        'KOOT_I18N_LOCALES',
        'KOOT_I18N_COOKIE_KEY',
        'KOOT_I18N_COOKIE_DOMAIN',
        'KOOT_I18N_URL_USE',
        'KOOT_HTML_TEMPLATE',
        'KOOT_PWA_AUTO_REGISTER',
        'KOOT_PWA_PATHNAME',
        'KOOT_DEV_START_TIME',
        'KOOT_DEV_DLL_FILE_CLIENT',
        'KOOT_DEV_DLL_FILE_SERVER',
        'KOOT_SESSION_STORE',
        'WEBPACK_CHUNKMAP',
        'WEBPACK_DEV_SERVER_PORT'
         */
        /**
         * 服务器端渲染时的 Public Path —— 请求静态资源的 URL 前缀
         * - 默认为 `/`
         *
         * > **⚠️** 仅针对: 服务器端
         *
         * > **⚠️** 经过 `JSON.stringify` 处理
         */
        KOOT_SSR_PUBLIC_PATH: string;
        /**
         * 构建目标
         * - _空_ - 默认
         * - serverless - Serverless App (SSR)
         * - electron - Electron App (SPA)
         */
        KOOT_BUILD_TARGET: '' | 'serverless' | 'electron';
        /**
         * 多语言项目种，URL 采用何种方式区分语种、切换语种
         * - **query** (默认)
         *     - URL 上无任何标识时，匹配默认语种
         *     - 添加 `hl` 参数时，会切换语种。如 `https://site.com/page-1/?hl=zh-cn`
         * - router - 一级路由为语种
         * - subdomain - 最深层的子域名为语种
         */
        KOOT_I18N_URL_USE: 'query' | 'router' | 'subdomain';
    }
}

// ============================================================================

declare interface KootAppConfig {
    /**
     * 项目名称
     *
     * 默认值: `package.json` 中的 `name` 属性
     *
     * 以下情况会使用该名称：
     * - SSR/同构：若首页组件没有通过 `extend()` 设定标题，默认使用该名作为页面标题。
     * - SPA：模板中的 `<%= inject.title %>` 默认使用该名进行注入替换。
     */
    name?: string;

    /**
     * 项目类型
     * - `react` [**默认**] React SSR/同构
     * - `react-spa` React SPA
     * @default react
     */
    type: 'react' | 'react-spa';
}

// ============================================================================

declare module 'react-redux' {
    interface DefaultRootState extends KootRootState {
        localeId: string;
        routing: {
            locationBeforeTransitions: LocationShape;
        };
        server: {
            cookie?:
                | string
                | {
                      [key: string]: string;
                  };
        };
    }
}
