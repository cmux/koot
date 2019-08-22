import { getCache } from 'koot';

const enhancerServerStartTime = createStore => (
    reducer,
    preloadedState,
    enhancer
) => {
    const store = createStore(reducer, preloadedState, enhancer);

    if (__SERVER__) {
        const cache = getCache();
        if (!cache.__kootTestServerStartTime) {
            const ts = Date.now();
            cache.__kootTestServerStartTime = ts;
        }
        store.__kootTestServerStartTime = cache.__kootTestServerStartTime;
    }

    return store;
};

export default [enhancerServerStartTime];

//
