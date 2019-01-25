import log from '../../../../../libs/log'

const afterDataToStore = async ({
    store, ctx, localeId, callback
}) => {
    if (__DEV__) log('callback', 'server', 'afterDataToStore')
    if (typeof callback === 'function')
        await callback({ ctx, store, localeId })
}

export default afterDataToStore
