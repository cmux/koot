import React from 'react';
import { Link } from 'react-router';
import {
    getStore,
    // getCache,
    // getLocaleId,
    history,
    // localeId,
    extend,
} from 'koot';

// console.log('[App]', { store, history, localeId })

import Nav from './_layout/nav';
import Main from './_layout/main';
import Debug from './debug';
import SSR from './ssr';

import styles from './app.less';

const { wrapper: componentClassName } = styles;

let stateShowed = false;

// eslint-disable-next-line no-undef
// console.log(AAAAAA);

@extend({
    connect: (state) => {
        if (__CLIENT__ && __DEV__ && !stateShowed) {
            console.log('root: redux store conected', state);
            stateShowed = true;
        }
        return {};
    },
    styles,
    name: 'App',
})
class App extends React.Component {
    componentDidMount() {
        if (__DEV__) {
            console.log('redux store', getStore());
            console.log('history', history);
        }
        if (__CLIENT__)
            console.log(
                `__KOOT_TEST_LOCALE_TRANSLATE_FUNCTION_ONLY_RESULT__||${__(
                    'test_img'
                )}||__`
            );
    }
    componentDidCatch(error, info) {
        if (__CLIENT__) console.log('ERROR', error, info);
        // Display fallback UI
        // this.setState({ hasError: true })
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }
    // componentDidUpdate() {
    //     console.log(this.props)
    // }
    render() {
        // console.log({
        //     'process.env.KOOT_SESSION_STORE': JSON.parse(
        //         process.env.KOOT_SESSION_STORE
        //     )
        // });
        // console.log('[App] render', { store, history, localeId })
        // console.log('App render', {
        //     'in __KOOT_SSR__': __KOOT_SSR__.LocaleId
        // });
        // console.log((typeof Store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' Store in [App] render')

        const serverStartTime = getStore().__kootTestServerStartTime;
        const pathnameTestImg = __('test_img');
        // console.log('App.jsx', this.props);

        return (
            <React.StrictMode>
                <div id="app" className={this.props.className}>
                    <Nav />
                    <Main children={this.props.children} />
                </div>
                <Debug />
                <SSR />
                <div className={componentClassName + '-hidden'}>
                    {/\./.test(pathnameTestImg) && (
                        <img
                            id="__test-translate-in-require"
                            // src={require(__('test_img'))}
                            src={__('test_img')}
                            alt="test-img"
                        />
                    )}
                    <div id="__test-links">
                        <Link to="/test-pageinfo-deep">_</Link>
                    </div>
                    <span id="__test-locales-export-object">
                        {__('pages.home').title}
                    </span>
                    {serverStartTime ? (
                        <span id="__test-store-enhancer-server-persist">
                            {serverStartTime}
                        </span>
                    ) : null}
                    {__SERVER__ && (
                        <span id="__test-ssr-lifecycle-before-pre-render">
                            {getStore().__TEST_BEFORE_PRE_RENDER__.__TEST__}
                        </span>
                    )}
                </div>
            </React.StrictMode>
        );
    }
}

export default App;
