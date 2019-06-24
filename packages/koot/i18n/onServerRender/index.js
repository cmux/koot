import {
    actionInit
    // actionLocales
} from '../redux';

export default ({ store }) => {
    // console.log(1)

    if (typeof store !== 'object' && typeof store.getState !== 'function')
        return;

    store.dispatch(actionInit(store.getState()));
    // if (JSON.parse(process.env.KOOT_I18N_TYPE) === 'store')
    //     store.dispatch(actionLocales(store.getState()))

    // console.log(2)
};
