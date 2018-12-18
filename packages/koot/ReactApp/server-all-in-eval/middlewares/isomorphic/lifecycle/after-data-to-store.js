import log from '../../../../../libs/log'

const afterDataToStore = async ({
    store, ctx, callback
}) => {
    if (__DEV__) log('callback', 'server', 'afterDataToStore')
    if (typeof callback === 'function')
        await callback({ store, ctx })
}

export default afterDataToStore
