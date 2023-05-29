/* eslint-disable import/no-anonymous-default-export */

export const needConnectComponents =
    typeof __SERVER__ !== 'undefined' && __SERVER__
        ? '__NEED_CONNECT_COMPONENTS__'
        : undefined;
export const ssrContext =
    typeof __SERVER__ !== 'undefined' && __SERVER__
        ? '__KOOT_SSR__'
        : undefined;
export const koaContext =
    typeof __SERVER__ !== 'undefined' && __SERVER__
        ? '__KOOT_CTX__'
        : undefined;

export default {
    needConnectComponents,
    ssrContext,
    koaContext,
};
