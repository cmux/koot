import resetStore from '../../../../React/redux/reset-store';

/**
 * 通过 redux 配置，初始化并获取 redux store 对象
 *
 * - 若提供产生 store 的方法 (`factoryStore`): 生成 store
 * - 若提供自生成的 store (`store`): 尝试清空 state 并触发一次所有 reducer 的初始化
 *
 * 每次访问请求时，需要生成全新的干净的 redux store，不可复用
 *
 * @param {Object} reduxConfig Redux，以下内容选其一
 * @param {Function} [reduxConfig.factoryStore] 生成 Redux Store 的方法
 * @param {Object} [reduxConfig.store] Redux Store 对象
 * @returns {Object} store
 */
const initStore = (reduxConfig = {}) => {
    const { store, factoryStore } = reduxConfig;

    if (typeof factoryStore === 'function') {
        return factoryStore();
    }

    if (typeof store === 'object') {
        return resetStore(store);
    }

    return {};
};

export default initStore;
