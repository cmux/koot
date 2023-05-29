import {
    ssrContext as SSRContext,
    koaContext as KOAContext,
} from './defaults/defines-server.js';
import { CACHE } from './defaults/defines-window.js';
import isRenderSafe from './React/is-render-safe.js';
import {
    get as getSSRContext,
    getKoaCtx,
    getLocaleId,
    resetLocaleId,
    resetStore,
    resetHistory,
} from './libs/ssr/context.js';

// ============================================================================

/**
 * 手动创建 Redux Store 时需要的相关对象
 * @type {Object}
 */
import * as _reduxForCreateStore from './React/redux.js';

const { createStore, ...reduxForCreateStore } = _reduxForCreateStore;
export { createStore, reduxForCreateStore };

/**
 * 通用的高阶组件/方法的装饰器
 * @type {Function}
 */
export { default as extend } from '__KOOT_HOC_EXTEND__';

// ============================================================================

export {
    localeId,
    store,
    getStore,
    history,
    getHistory,
} from './libs/ssr/context';
export { getLocaleId, resetLocaleId, resetStore, resetHistory };

// ============================================================================

export const getCache = (localeId) => {
    if (!isRenderSafe()) return {};
    if (__CLIENT__) {
        if (typeof window[CACHE] !== 'object') window[CACHE] = {};
        return window[CACHE];
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
        resetLocaleId(v);
    };
    global.__KOOT_SSR_SET_STORE__ = (v) => {
        global.__KOOT_STORE__ = v;
        resetStore(v);
    };
    global.__KOOT_SSR_SET_HISTORY__ = (v) => {
        global.__KOOT_HISTORY__ = v;
        resetHistory(v);
    };
    global.__KOOT_SSR_SET_CTX__ = (v) => {
        global[KOAContext] = v;
    };
}
