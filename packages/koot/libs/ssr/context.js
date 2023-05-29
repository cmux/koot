/* eslint-disable import/no-anonymous-default-export */

/* global
    __KOOT_SSR__:false
    __KOOT_CTX__:false
*/

/**
 * 当前 SSR context 对象
 * @typedef {Object} KootSSRContext
 * @property {Object} Store - 数据存储空间
 * @property {History} History - 历史纪录对象
 * @property {string} [LocaleId] - 当前语种ID
 * @property {Object} [locales] - 语言包对象，包含所有语种
 * @property {Map} globalCache - 公共缓存空间
 * @property {Object} [proxyRequestOrigin={}] - 配置项 `proxyRequestOrigin`
 * @property {string} template - EJS 模板
 * @property {Object} [templateInject={}] - EJS 自定义注入对象
 *
                    thisTemplateInjectCache,
                    thisEntrypoints,
                    thisFilemap, //thisStyleMap,
                    thisManifest,
                    styleMap,
                    connectedComponents: __DEV__
                        ? (global[SSRContext]
                              ? global[SSRContext].connectedComponents
                              : []) || []
                        : [],
 */

// ============================================================================

import {
    LOCALEID as ClientLocaleId,
    STORE as ClientStore,
    HISTORY as ClientHistory,
} from '../../defaults/defines-window.js';
import {
    ssrContext as SSRContext,
    koaContext as KOAContext,
} from '../../defaults/defines-server.js';

// ============================================================================

/** @type {KootSSRContext} */
let kootSSRContext;
let koaCtx;

if (__DEV__ && __SERVER__) {
    global[SSRContext] = {};
}

// ============================================================================

/**
 * 获取 SSR context 对象
 * @returns {KootSSRContext}
 */
export function get() {
    if (__CLIENT__) return {};
    if (__DEV__) return global[SSRContext];
    if (typeof kootSSRContext === 'object') return kootSSRContext;
    if (typeof __KOOT_SSR__ === 'object') return __KOOT_SSR__;
    return {};
}

/**
 * 获取 Koa ctx 对象
 */
export function getKoaCtx() {
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
export function set(ctx) {
    if (__CLIENT__) return;
    // console.log('set', ctx, 'locales', ctx[SSRContext].locales);
    if (__DEV__) return global.__KOOT_SSR_SET__(ctx);
    kootSSRContext = ctx[SSRContext];
    koaCtx = ctx;
    resetLocaleId();
    resetStore();
    resetHistory();
}

// ============================================================================

export const getLocaleId = () => {
    if (__CLIENT__) return window[ClientLocaleId] || '';
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_LOCALEID__;
        return get().LocaleId;
    }
};
export let localeId = (() => getLocaleId())();
export const resetLocaleId = (newValue) => {
    if (__SERVER__ && newValue === false) {
        localeId = undefined;
        delete get().LocaleId;
        return;
    }
    if (newValue) get().LocaleId = newValue;
    localeId = newValue || getLocaleId();
};

// ============================================================================

export const getStore = () => {
    if (__CLIENT__) return window[ClientStore];
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_STORE__;
        return get().Store;
    }
};
export let store = (() => getStore())();
export const resetStore = (newValue) => {
    if (newValue) get().Store = newValue;
    store = newValue || getStore();
};

// ============================================================================

export const getHistory = () => {
    if (__CLIENT__) return window[ClientHistory];
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_HISTORY__;
        return get().History;
    }
};
export let history = (() => getHistory())();
export const resetHistory = (newValue) => {
    if (newValue) get().History = newValue;
    history = newValue || getHistory();
};

// ============================================================================

export function reset() {
    resetLocaleId(false);
    // purgeObj(kootSSRContext);
    kootSSRContext = undefined;
    koaCtx = undefined;
}
// const purgeObj = (obj) => {
//     if (typeof obj === 'object') {
//         for (const [key, value] of Object.entries(obj)) {
//             if (typeof value === 'object') {
//                 purgeObj(value);
//             }
//             // console.log(key);
//             try {
//                 obj[key] = undefined;
//             } catch (e) {}
//             delete obj[key];
//         }
//     }
// };

// ============================================================================

export default {
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
