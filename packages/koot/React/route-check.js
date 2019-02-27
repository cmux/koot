/**
 * 检查下一个路由状态和当前客户端的 location 是否一致。多用于针对基于路由代码拆分的当前路由检测。
 * @param {Object} nextState `react-router` 传入的下一个路由状态对象
 * @param {Boolean} [isAlwaysTrue=false] 是否默认为 `true`
 * @returns {Boolean}
 */
module.exports = (nextState, isAlwaysTrue) => {
    if (isAlwaysTrue ||
        typeof location === 'undefined' ||
        __SERVER__ ||
        __SPA__
    ) return true

    let next = nextState.location.pathname
    let curr = location.pathname

    if (next.substr(0, 1) !== '/') next = '/' + next
    if (curr.substr(0, 1) !== '/') curr = '/' + curr

    return Boolean(next === curr)
}
