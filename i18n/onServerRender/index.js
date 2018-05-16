import {
    actionInit,
    actionLocales
} from '../redux'

export default ({
    reduxStore
}) => {
    reduxStore.dispatch(actionInit(reduxStore.getState()))
    if (JSON.parse(process.env.SUPER_I18N_TYPE) === 'redux')
        reduxStore.dispatch(actionLocales())
}
