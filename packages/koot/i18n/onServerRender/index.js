import {
    actionInit,
    actionLocales
} from '../redux'

export default ({
    store
}) => {
    store.dispatch(actionInit(store.getState()))
    if (JSON.parse(process.env.KOOT_I18N_TYPE) === 'redux')
        store.dispatch(actionLocales())
}
