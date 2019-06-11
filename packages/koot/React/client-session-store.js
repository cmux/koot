import { store as Store } from '../';

const sessionStorageKey = '__KOOT_SESSION_STORE__';
const configSessionStore = JSON.parse(process.env.KOOT_SESSION_STORE);

/** @type {String[]} 这些项目不予同步 */
const itemsBlacklist = ['localeId', 'realtimeLocation', 'routing', 'server'];

/** @type {Boolean} 当前是否可以/允许使用 sessionStore */
const able = (() => {
    if (__SERVER__) return false;
    if (!window.sessionStorage) return false;
    if (!configSessionStore) return false;

    if (configSessionStore === true) return true;
    if (configSessionStore === 'all') return true;

    return Boolean(
        typeof configSessionStore === 'object' &&
            !Array.isArray(configSessionStore)
    );
})();

/**
 * 保存当前 state 到 sessionStorage
 * @void
 */
export const save = () => {
    if (!able) return;

    /** @type {Object} 排除掉黑名单内的项目后的 state 对象 */
    const state = itemsBlacklist.reduce((state, item) => {
        const { [item]: _, ...rest } = state;
        return rest;
    }, Store.getState());

    sessionStorage.setItem(
        sessionStorageKey,
        configSessionStore === true || configSessionStore === 'all'
            ? JSON.stringify(state)
            : (state => {
                  const result = {};
                  console.log({ configSessionStore, state, result });
                  return JSON.stringify(result);
              })(state)
    );

    return;
};

/**
 * 向 window.onunload 添加事件：保存 state
 * @void
 */
export const addEventHandlerOnPageUnload = () => {
    if (!able) return;
    window.addEventListener('unload', save);
    return;
};

/**
 * 从 sessionStorage 中读取 state
 * @returns {Object} 存储的 state
 */
export const load = () => {
    if (!able) return {};

    if (configSessionStore === true || configSessionStore === 'all')
        return JSON.parse(sessionStorage.getItem(sessionStorageKey) || '{}');

    const result = {};

    return result;
};
