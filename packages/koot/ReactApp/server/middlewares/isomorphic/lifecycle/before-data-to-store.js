import log from '../../../../../libs/log'

const beforeDataToStore = async ({
    ctx, store, localeId, callback
}) => {
    if (__DEV__) log(' ', 'server', `localeId > \x1b[32m${localeId}\x1b[0m`)
    if (__DEV__) log('callback', 'server', 'beforeDataToStore')
    if (typeof callback === 'function')
        await callback({ ctx, store, localeId })
}

export default beforeDataToStore
