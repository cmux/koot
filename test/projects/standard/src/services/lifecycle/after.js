/**
 * 生命周期回调: UI 完全初始化后
 * @param {Object} args
 * @returns {Promise}
 */
export default a => {
    if (
        typeof a === 'object' &&
        typeof a.store === 'object' &&
        typeof a.store.getState === 'function'
    ) {
        console.log('__KOOT_TEST_CLIENT_AFTER_SUCCESS__');
    } else {
        console.log('__KOOT_TEST_CLIENT_AFTER_FAIL__');
    }

    return true;
};
