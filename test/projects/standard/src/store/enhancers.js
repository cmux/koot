const enhancerServerStartTime = createStore => (
    reducer,
    preloadedState,
    enhancer
) => {
    const store = createStore(reducer, preloadedState, enhancer);

    if (__SERVER__) {
        store.__kootTestServerStartTime = Date.now();
    }

    return store;
};

export default [enhancerServerStartTime];

//
