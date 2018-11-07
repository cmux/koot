module.exports = (nextState, isAlwaysTrue) => (
    (isAlwaysTrue || typeof location === 'undefined' || __SERVER__ || __SPA__)
        ? true
        : (nextState.location.pathname === location.pathname)
)
