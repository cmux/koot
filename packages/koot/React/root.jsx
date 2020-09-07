import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

import RootContext, { createValue as createContextValue } from './root-context';
import { markInited } from './client-update-page-info';

// import { StyleMapContext } from './styles'

class Root extends React.Component {
    componentDidMount() {
        markInited();
        if (typeof window.__KOOT_DEV_NATIVE_CONSOLE__ === 'object') {
            setTimeout(() => {
                Object.entries(window.__KOOT_DEV_NATIVE_CONSOLE__).forEach(
                    ([key, value]) => {
                        window.console[key] = value;
                    }
                );
            });
        }
    }
    componentDidCatch(err, info) {
        console.error("!! Error caught at Koot's Root component !!", err, info);
    }
    render() {
        const { store, history, routes, locales, ...props } = this.props;
        return (
            // <StyleMapContext.Provider value={{}}>
            <RootContext.Provider
                value={createContextValue({
                    store,
                    history,
                    localeId: props.localeId,
                    locales,
                })}
            >
                <Provider store={store}>
                    <Router history={history} store={store} {...props}>
                        {routes}
                    </Router>
                </Provider>
            </RootContext.Provider>
            // </StyleMapContext.Provider>
        );
    }
}
// export default Root;
export default hot(Root);

// let e = Root;

// if (__DEV__) {
//     const { hot } = require('react-hot-loader/root');
//     // setConfig({ logLevel: 'debug' })
//     e = hot(Root);
// }

// export default e;
