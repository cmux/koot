module.exports =
    typeof __SERVER__ !== 'undefined' && __SERVER__
        ? {
              needConnectComponents: '__NEED_CONNECT_COMPONENTS__',
              ssrContext: '__KOOT_SSR__',
              koaContext: '__KOOT_CTX__',
          }
        : {};
