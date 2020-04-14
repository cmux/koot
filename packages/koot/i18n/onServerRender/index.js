import {
    actionInit,
    // actionLocales
} from '../redux';

export default (store, localeId) => {
    // console.log(1)

    if (typeof store !== 'object' && typeof store.getState !== 'function')
        return;

    store.dispatch(actionInit(localeId));
    // if (JSON.parse(process.env.KOOT_I18N_TYPE) === 'store')
    //     store.dispatch(actionLocales(store.getState()))

    // console.log(2)
};
