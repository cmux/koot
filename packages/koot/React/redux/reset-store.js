/**
 * 重置 store，清空所有 state
 * @param {Object} store
 * @param {string[]} [keysToPreserve]
 */
const resetStore = (store, keysToPreserve = defaultKeysToPreserve) => {
    const state = store.getState();
    Object.keys(state)
        .filter(key => !keysToPreserve.includes(key))
        .forEach(key => {
            state[key] = undefined;
            delete state[key];
        });

    // 触发所有 reducer 的初始化
    store.dispatch({
        type: '@@KOOT@@STATE_RESET_REDUCER_INIT'
    });

    return store;
};

/** @type {Array} 需要保留（不需要进行删除操作）的 redux store state 属性名 */
export const defaultKeysToPreserve = [
    'localeId',
    'locales'
    // 'server'
];

export default resetStore;
