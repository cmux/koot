module.exports = __CLIENT__
    ? {}
    : {
          needConnectComponents: '__NEED_CONNECT_COMPONENTS__',
          ssrContext: '__KOOT_SSR__',
          koaContext: '__KOOT_CTX__',
      };
