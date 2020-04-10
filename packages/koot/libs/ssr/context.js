/* global
    __KOOT_SSR__:false
    __KOOT_CTX__:false
*/

const {
    ssrContext: SSRContext,
    koaContext: KOAContext,
} = require('../../defaults/defines-server');

/**
 * 当前 SSR context 对象
 * @typedef {Object} KootSSRContext
 * @property {string} [LocaleId] - 当前语种ID
 * @property {Object} [locales] - 当前语种的语言包对象
 * @property {Map} globalCache - 公共缓存空间
 */

/** @type {KootSSRContext} */
let kootSSRContext;
let koaCtx;

/**
 * 获取 SSR context 对象
 * @returns {KootSSRContext}
 */
function get() {
    if (__CLIENT__) return {};
    if (__DEV__) return global[SSRContext];
    if (typeof kootSSRContext === 'object') return kootSSRContext;
    if (typeof __KOOT_SSR__ === 'object') return __KOOT_SSR__;
    return {};
}

/**
 * 获取 Koa ctx 对象
 */
function getKoaCtx() {
    if (__CLIENT__) return {};
    if (__DEV__) return global[KOAContext];
    if (typeof koaCtx === 'object') return koaCtx;
    if (typeof __KOOT_CTX__ === 'object') return __KOOT_CTX__;
    return {};
}

/**
 * 设置当前 Koa ctx 和 Koot SSR context 对象
 * @param {*} ctx
 */
function set(ctx) {
    if (__CLIENT__) return;
    // console.log('set', ctx, 'locales', ctx[SSRContext].locales);
    if (__DEV__) return global.__KOOT_SSR_SET__(ctx);
    kootSSRContext = ctx[SSRContext];
    koaCtx = ctx;
}

function reset() {
    kootSSRContext = undefined;
    koaCtx = undefined;
}

module.exports = {
    set,
    get,
    getKoaCtx,
    reset,
};
