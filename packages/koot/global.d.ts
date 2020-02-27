/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

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
         * - static - 静态化站点
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
        'KOOT_CLIENT_BUNDLE_SUBFOLDER',
        'WEBPACK_CHUNKMAP',
        'WEBPACK_DEV_SERVER_PORT'
         */
        /**
         * 服务器模式
         * - _空_ - 默认模式
         * - serverless
         */
        KOOT_SERVER_MODE: '' | 'serverless';
    }
}
