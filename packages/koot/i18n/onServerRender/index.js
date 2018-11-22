import {
    actionInit,
    actionLocales
} from '../redux'

export default ({
    store
}) => {
    // console.log(1)

    if (typeof store !== 'object' && typeof store.getState !== 'function')
        return

    const state = store.getState()

    store.dispatch(actionInit(state))
    if (JSON.parse(process.env.KOOT_I18N_TYPE) === 'redux')
        store.dispatch(actionLocales(state))

    // console.log(2)
}
