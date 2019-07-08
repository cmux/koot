import React from 'react';
import { Link } from 'react-router';
import { store, history, localeId, extend } from 'koot';

// console.log('[App]', { store, history, localeId })

import Nav from './_layout/nav';
import Main from './_layout/main';
import Debug from './debug';
import SSR from './ssr';

import styles from './app.less';

const { wrapper: componentClassName } = styles;

let stateShowed = false;

@extend({
    connect: state => {
        if (__CLIENT__ && __DEV__ && !stateShowed) {
            console.log('root: redux store conected', state);
            stateShowed = true;
        }
        return {};
    },
    styles,
    name: 'App'
})
class App extends React.Component {
    componentDidMount() {
        if (__DEV__) {
            console.log('redux store', store);
            console.log('history', history);
        }
    }
    componentDidCatch(error, info) {
        console.log('ERROR', error, info);
        // Display fallback UI
        // this.setState({ hasError: true })
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }
    componentDidUpdate() {
        // console.log(this.props)
    }
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
        return (
            <React.StrictMode>
                <div id="app" className={this.props.className}>
                    <Nav />
                    <Main children={this.props.children} />
                </div>
                <Debug />
                <SSR />
                <div className={componentClassName + '-hidden-route-links'}>
                    <Link to="/test-pageinfo-deep">_</Link>
                </div>
            </React.StrictMode>
        );
    }
}

export default App;
