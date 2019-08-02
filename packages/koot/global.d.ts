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
type translateResult = any;

/** 多语言翻译函数 */
declare function __(...keys: string[]): translateResult;
declare function __(key: string, replaces: TranslateReplaces): translateResult;
declare function __(
    key1: string,
    key2: string,
    replaces: TranslateReplaces
): translateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    replaces: TranslateReplaces
): translateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    replaces: TranslateReplaces
): translateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    replaces: TranslateReplaces
): translateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    replaces: TranslateReplaces
): translateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    key6: string,
    replaces: TranslateReplaces
): translateResult;
declare function __(
    key1: string,
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    key6: string,
    key7: string,
    replaces: TranslateReplaces
): translateResult;
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
): translateResult;
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
): translateResult;
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
): translateResult;

// ============================================================================

declare interface KootComponentStyleObject {
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
declare module '*.module.css' {
    const kootComponentStyleCSS: KootComponentStyleObject;
    export = kootComponentStyleCSS;
}
declare module '*.component.css' {
    const kootComponentStyleCSS: KootComponentStyleObject;
    export = kootComponentStyleCSS;
}
declare module '*.view.css' {
    const kootComponentStyleCSS: KootComponentStyleObject;
    export = kootComponentStyleCSS;
}
declare module '*.module.sass' {
    const kootComponentStyleSASS: KootComponentStyleObject;
    export = kootComponentStyleSASS;
}
declare module '*.component.sass' {
    const kootComponentStyleSASS: KootComponentStyleObject;
    export = kootComponentStyleSASS;
}
declare module '*.view.sass' {
    const kootComponentStyleSASS: KootComponentStyleObject;
    export = kootComponentStyleSASS;
}
declare module '*.module.scss' {
    const kootComponentStyleSCSS: KootComponentStyleObject;
    export = kootComponentStyleSCSS;
}
declare module '*.component.scss' {
    const kootComponentStyleSCSS: KootComponentStyleObject;
    export = kootComponentStyleSCSS;
}
declare module '*.view.scss' {
    const kootComponentStyleSCSS: KootComponentStyleObject;
    export = kootComponentStyleSCSS;
}
declare module '*.module.less' {
    const kootComponentStyleLESS: KootComponentStyleObject;
    export = kootComponentStyleLESS;
}
declare module '*.component.less' {
    const kootComponentStyleLESS: KootComponentStyleObject;
    export = kootComponentStyleLESS;
}
declare module '*.view.less' {
    const kootComponentStyleLESS: KootComponentStyleObject;
    export = kootComponentStyleLESS;
}
