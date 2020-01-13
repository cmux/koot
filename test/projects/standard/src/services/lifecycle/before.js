/**
 * 生命周期回调: UI 初始化之前
 * @returns {Promise}
 */
export default a => {
    // console.log('⚓ Client initialing...')

    if (
        typeof a === 'object' &&
        typeof a.store === 'object' &&
        typeof a.store.getState === 'function'
    ) {
        console.log('__KOOT_TEST_CLIENT_BEFORE_SUCCESS__');
    } else {
        console.log('__KOOT_TEST_CLIENT_BEFORE_FAIL__', a);
    }

    return true;
};
