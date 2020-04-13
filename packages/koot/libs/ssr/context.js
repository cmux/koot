/* global
    __KOOT_SSR__:false
    __KOOT_CTX__:false
*/

/**
 * 当前 SSR context 对象
 * @typedef {Object} KootSSRContext
 * @property {string} [LocaleId] - 当前语种ID
 * @property {Object} [locales] - 当前语种的语言包对象
 * @property {Map} globalCache - 公共缓存空间
 */

// ============================================================================

const {
    ssrContext: SSRContext,
    koaContext: KOAContext,
} = require('../../defaults/defines-server');

// ============================================================================

/** @type {KootSSRContext} */
let kootSSRContext;
let koaCtx;

if (__DEV__) {
    global[SSRContext] = {};
}

// ============================================================================

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

// ============================================================================

const getLocaleId = () => {
    if (__CLIENT__) return window.__KOOT_LOCALEID__ || '';
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_LOCALEID__;
        return get().LocaleId;
    }
};
let localeId = (() => getLocaleId())();
const resetLocaleId = (newValue) => {
    if (__SERVER__ && newValue === false) {
        localeId = undefined;
        delete get().LocaleId;
        return;
    }
    localeId = newValue || getLocaleId();
};

// ============================================================================

const getStore = () => {
    if (__CLIENT__) return window.__KOOT_STORE__;
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_STORE__;
        return get().Store;
    }
};
let store = (() => getStore())();
const resetStore = (newValue) => {
    if (__SERVER__ && newValue === false) {
        store = undefined;
        delete get().Store;
        return;
    }
    store = newValue || getStore();
};

// ============================================================================

const getHistory = () => {
    if (__CLIENT__) return window.__KOOT_HISTORY__;
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_HISTORY__;
        return get().History;
    }
};
let history = (() => getHistory())();
const resetHistory = (newValue) => {
    if (__SERVER__ && newValue === false) {
        history = undefined;
        delete get().History;
        return;
    }
    history = newValue || getHistory();
};

// ============================================================================

function reset() {
    kootSSRContext = undefined;
    koaCtx = undefined;
    resetLocaleId(false);
    resetStore(false);
    resetHistory(false);
}

// ============================================================================

module.exports = {
    set,
    get,
    getKoaCtx,

    localeId,
    getLocaleId,
    resetLocaleId,

    store,
    getStore,
    resetStore,

    history,
    getHistory,
    resetHistory,

    reset,
};
