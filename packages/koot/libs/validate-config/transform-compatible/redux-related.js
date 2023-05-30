/* eslint-disable import/no-anonymous-default-export */
import '../../../typedef.js';

/**
 * 配置转换 - 兼容性处理 - Redux 相关选项
 * - store
 * - reducers
 * - cookiesToStore
 * @async
 * @param {AppConfig} config
 * @void
 */
export default async (config) => {
    if (
        typeof config.store !== 'undefined' &&
        typeof config.redux === 'object'
    ) {
        delete config.redux.store;
    } else if (typeof config.redux === 'object') {
        config.store = config.redux.store;
        delete config.redux.store;
    }

    if (
        typeof config.reducers !== 'undefined' &&
        typeof config.redux === 'object'
    ) {
        delete config.redux.combineReducers;
    } else if (typeof config.redux === 'object') {
        config.reducers = config.redux.combineReducers;
        delete config.redux.combineReducers;
    }

    if (
        typeof config.cookiesToStore !== 'undefined' &&
        typeof config.redux === 'object'
    ) {
        delete config.redux.syncCookie;
    } else if (typeof config.redux === 'object') {
        config.cookiesToStore = config.redux.syncCookie;
        delete config.redux.syncCookie;
    }
};
