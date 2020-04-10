import {
    ssrContext as SSRContext,
    koaContext as KOAContext,
} from './defaults/defines-server';
import isRenderSafe from './React/is-render-safe';
import { get as getSSRContext, getKoaCtx } from './libs/ssr/context';

// ============================================================================

/**
 * 手动创建 Redux Store 时需要的相关对象
 * @type {Object}
 */
import * as _reduxForCreateStore from './React/redux';

const { createStore, ...reduxForCreateStore } = _reduxForCreateStore;
export { createStore, reduxForCreateStore };

/**
 * 通用的高阶组件/方法的装饰器
 * @type {Function}
 */
export { default as extend } from '__KOOT_HOC_EXTEND__';

// ============================================================================

export const getLocaleId = () => {
    if (__CLIENT__) return window.__KOOT_LOCALEID__ || '';
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_LOCALEID__;
        return getSSRContext().LocaleId;
    }
};
export const resetLocaleId = () => (localeId = getLocaleId());
export let localeId = (() => getLocaleId())();

// ============================================================================

export const getStore = () => {
    if (__CLIENT__) return window.__KOOT_STORE__;
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_STORE__;
        return getSSRContext().Store;
    }
};
export const resetStore = () => (store = getStore());
export let store = (() => getStore())();

// ============================================================================

export const getHistory = () => {
    if (__CLIENT__) return window.__KOOT_HISTORY__;
    if (__SERVER__) {
        if (__DEV__) return global.__KOOT_HISTORY__;
        return getSSRContext().History;
    }
};
export const resetHistory = () => (history = getHistory());
export let history = (() => getHistory())();

// ============================================================================

export const getCache = (localeId) => {
    if (!isRenderSafe()) return {};
    if (__CLIENT__) {
        if (typeof window.__KOOT_CACHE__ !== 'object')
            window.__KOOT_CACHE__ = {};
        return window.__KOOT_CACHE__;
    }
    if (__SERVER__) {
        const cache = getSSRContext().globalCache;
        if (!cache) return {};
        if (localeId === true) return cache.get(getLocaleId());
        if (localeId) return cache.get(localeId) || {};
        return cache.get('__');
    }
};

// ============================================================================

export { getKoaCtx as getCtx };

// ============================================================================

if (__DEV__) {
    global.__KOOT_SSR_SET__ = (ctx) => {
        global[KOAContext] = ctx;
        global[SSRContext] = ctx[SSRContext];
    };
    global.__KOOT_SSR_SET_LOCALEID__ = (v) => {
        global.__KOOT_LOCALEID__ = v;
        localeId = v;
    };
    global.__KOOT_SSR_SET_STORE__ = (v) => {
        global.__KOOT_STORE__ = v;
        store = v;
    };
    global.__KOOT_SSR_SET_HISTORY__ = (v) => {
        global.__KOOT_HISTORY__ = v;
        history = v;
    };
    global.__KOOT_SSR_SET_CTX__ = (v) => {
        global[KOAContext] = v;
    };
    // if (__CLIENT__) {
    //     window.__DEV_KOOT_GET_STYLES__ = getStyles;
    // }
}
