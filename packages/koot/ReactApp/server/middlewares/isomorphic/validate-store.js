/**
 * 获取 redux store 对象
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
const validateStore = (reduxConfig = {}) => {

    const { store, factoryStore } = reduxConfig

    if (typeof factoryStore === 'function') {
        return factoryStore()
    }

    if (typeof store === 'object') {
        // 清空 state
        const state = store.getState()
        Object.keys(state)
            .filter(key => !keysToPreserve.includes(key))
            .forEach(key => {
                state[key] = undefined
                delete state[key]
            })

        // 触发所有 reducer 的初始化
        store.dispatch({
            type: '@@KOOT@@STATE_RESET_REDUCER_INIT'
        })

        return store
    }

    return {}
}

export default validateStore

/** @type {Array} 需要保留（不需要进行删除操作）的 redux store state 项名 */
const keysToPreserve = [
    'localeId',
    'locales',
    // 'server'
]
