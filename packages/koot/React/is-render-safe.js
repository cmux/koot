/* global __KOOT_SSR__:false */

const { needConnectComponents } = require('../defaults/defines-server');

/**
 * 当前执行和渲染有关的操作是否安全
 * - 客户端: 永远安全
 * - 服务器端: SSR `dataToStore` 之前不安全，之后安全
 * @returns {boolean}
 */
module.exports = () => {
    if (__SERVER__) {
        const SSR = __DEV__ ? global.__KOOT_SSR__ : __KOOT_SSR__;
        if (SSR[needConnectComponents]) return false;
        return true;
    }
    return true;
};
