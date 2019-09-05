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
     * 组件 `className`
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
