/**
 * 请求响应: 获取 redux store 对象
 * 
 * 
 * 若提供自生成的 store: 尝试清空 state 并触发一次所有 reducer 的初始化
 * 
 * 若提供产生 store 的方法: 产生 store
 * 
 * 
 * 每次访问请求时，需要生成全新的干净的 redux store，不可复用
 * 
 * 
 * @param {Object|Function} store Object 表示项目自生成的 store；Function 表示产生 store 的方法
 * @returns {Object} store
 */
module.exports = (store) => {

    if (typeof store === 'object') {
        // 清空 state
        const state = store.getState()
        Object.keys(state)
            .filter(key => !stateKeysPreserved.includes(key))
            .forEach(key => delete state[key])

        // 触发 reducer 初始化
        store.dispatch({
            type: '@@KOOT@@STATE_RESET_REDUCER_INIT'
        })

        return store
    }

    if (typeof store === 'function') {
        return store()
    }

    return {}
}

/** @type {Array} 需要保留（不需要进行删除操作）的 redux store state 项名 */
const stateKeysPreserved = [
    'localeId',
    'locales',
    'server'
]
