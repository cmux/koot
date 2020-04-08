/* global
    __KOOT_SSR__:false
*/

export default () => {
    if (__CLIENT__) return {};
    if (__DEV__) return global.__KOOT_SSR__;
    if (typeof __KOOT_SSR__ === 'undefined') return {};
    return __KOOT_SSR__;
};
