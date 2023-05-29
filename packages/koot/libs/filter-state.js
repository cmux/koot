const itemsBlacklist = ['localeId', 'realtimeLocation', 'routing', 'server'];

/**
 * 过滤 state，将黑名单内的项目删除，并返回过滤后的 state
 *
 * 黑名单中包括：
 * - `localeId`
 * - `realtimeLocation`
 * - `routing`
 * - `server`
 *
 * @param {Object} state
 * @returns {Object}
 */
const filter = (oldState) =>
    itemsBlacklist.reduce((state, item) => {
        const { [item]: _, ...rest } = state;
        return rest;
    }, oldState);

export default filter;
