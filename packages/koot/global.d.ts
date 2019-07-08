/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare function __(...translateKeys: Array<string>): String;
/** 当前是否为客户端 */
declare const __CLIENT__: Boolean;
/** 当前是否为服务器端 */
declare const __SERVER__: Boolean;
/** 当前是否为开发环境 */
declare const __DEV__: Boolean;
/** 当前是否为 SPA 模式 */
declare const __SPA__: Boolean;

//

interface kootComponentStyleObject {
    wrapper: string;
    css: string;
}
declare module '*.module.css' {
    const kootComponentStyleCSS: kootComponentStyleObject;
    export = kootComponentStyleCSS;
}
declare module '*.component.css' {
    const kootComponentStyleCSS: kootComponentStyleObject;
    export = kootComponentStyleCSS;
}
declare module '*.view.css' {
    const kootComponentStyleCSS: kootComponentStyleObject;
    export = kootComponentStyleCSS;
}
declare module '*.module.sass' {
    const kootComponentStyleSASS: kootComponentStyleObject;
    export = kootComponentStyleSASS;
}
declare module '*.component.sass' {
    const kootComponentStyleSASS: kootComponentStyleObject;
    export = kootComponentStyleSASS;
}
declare module '*.view.sass' {
    const kootComponentStyleSASS: kootComponentStyleObject;
    export = kootComponentStyleSASS;
}
declare module '*.module.scss' {
    const kootComponentStyleSCSS: kootComponentStyleObject;
    export = kootComponentStyleSCSS;
}
declare module '*.component.scss' {
    const kootComponentStyleSCSS: kootComponentStyleObject;
    export = kootComponentStyleSCSS;
}
declare module '*.view.scss' {
    const kootComponentStyleSCSS: kootComponentStyleObject;
    export = kootComponentStyleSCSS;
}
declare module '*.module.less' {
    const kootComponentStyleLESS: kootComponentStyleObject;
    export = kootComponentStyleLESS;
}
declare module '*.component.less' {
    const kootComponentStyleLESS: kootComponentStyleObject;
    export = kootComponentStyleLESS;
}
declare module '*.view.less' {
    const kootComponentStyleLESS: kootComponentStyleObject;
    export = kootComponentStyleLESS;
}
