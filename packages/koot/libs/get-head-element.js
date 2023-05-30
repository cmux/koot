/* eslint-disable import/no-anonymous-default-export */

export default () => {
    return process.env.KOOT_BUILD_TARGET === 'qiankun'
        ? document.getElementsByTagName('qiankun-head')?.[0] ??
              document.getElementsByTagName('head')[0]
        : document.getElementsByTagName('head')[0];
};
