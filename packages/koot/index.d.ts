/// <reference path="global.d.ts" />

import React from 'react';

declare module 'koot';

//

export const extend: (
    options: extendOptions
) => (
    component:
        | React.Component<extendInjectedProps>
        | React.FC<extendInjectedProps>
) => React.Component;

// @extend() ==================================================================

interface extendOptions {
    connect?: function;
    pageinfo?: {
        title?: string;
        metas?: Array;
    };
    data?: extendDataFetch | extendData;
    styles?: kootComponentStyleObject;
}
type extendDataFetch = (
    store: Object,
    renderProps: Object,
    dispatch: function
) => Promise<any>;
interface extendData {
    fetch?: extendDataFetch;
    check?: function;
}
interface extendInjectedProps {
    className?: string;
}

//

interface kootComponentStyleObject {
    wrapper: string;
    css: string;
}
