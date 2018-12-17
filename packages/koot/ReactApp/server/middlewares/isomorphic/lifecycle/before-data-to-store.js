import log from '../../../../../libs/log'

const beforeDataToStore = async ({
    store, ctx, localeId, callback
}) => {
    if (__DEV__) log(' ', 'server', `localeId > \x1b[32m${localeId}\x1b[0m`)
    if (__DEV__) log('callback', 'server', 'beforeDataToStore')
    if (typeof callback === 'function')
        await callback({ store, ctx })
}

export default beforeDataToStore
