import { Component } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

import { DEV_NATIVE_CONSOLE } from '../defaults/defines-window';
import RootContext, { createValue as createContextValue } from './root-context';
import { markInited } from './client-update-page-info';

// import { StyleMapContext } from './styles'

class Root extends Component {
    componentDidMount() {
        markInited();
        if (typeof window[DEV_NATIVE_CONSOLE] === 'object') {
            setTimeout(() => {
                Object.entries(window[DEV_NATIVE_CONSOLE]).forEach(
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
export default Root;
