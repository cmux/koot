/* global
    __KOOT_SSR__:false
*/

export default () => {
    if (__CLIENT__) return {}
    return __DEV__ ? global.__KOOT_SSR__ : __KOOT_SSR__
}
