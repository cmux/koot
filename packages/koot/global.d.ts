declare function __(...translateKeys: Array<string>): String;

//

interface kootComponentStyleObject {
    wrapper: string;
    css: string;
}
declare module '*.css' {
    const kootComponentStyleCSS: kootComponentStyleObject;
    export = kootComponentStyleCSS;
}
declare module '*.sass' {
    const kootComponentStyleSASS: kootComponentStyleObject;
    export = kootComponentStyleSASS;
}
declare module '*.scss' {
    const kootComponentStyleSCSS: kootComponentStyleObject;
    export = kootComponentStyleSCSS;
}
declare module '*.less' {
    const kootComponentStyleLESS: kootComponentStyleObject;
    export = kootComponentStyleLESS;
}
