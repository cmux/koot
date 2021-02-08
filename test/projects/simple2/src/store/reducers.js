import infos from './infos/reducer';

if (__CLIENT__) {
    if (typeof window.__REDUX_STOER_RUN_COUNT__ === 'undefined')
        window.__REDUX_STOER_RUN_COUNT__ = 0;
    window.__REDUX_STOER_RUN_COUNT__++;
}

export default {
    infos,
};
