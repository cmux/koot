import { Component, StrictMode } from 'react';
import { getStore, getHistory, extend } from 'koot';
import clientGetStyles from 'koot/utils/client-get-styles';

import Nav from './_layout/nav';
import Main from './_layout/main';

import styles from './app.component.less';

let stateShowed = false;

@extend({
    connect: (state) => {
        if (__CLIENT__ && __DEV__ && !stateShowed) {
            console.log('root: redux store conected', state);
            stateShowed = true;
        }
        return {};
    },
    styles,
})
class App extends Component {
    componentDidMount() {
        if (__DEV__) {
            console.log('redux store', getStore());
            console.log('history', getHistory());
        }
        if (__CLIENT__) {
            window.__KOOT_TEXT_GET_STYLES__ = clientGetStyles;
        }
    }
    componentDidCatch(error, info) {
        console.log('ERROR', error, info);
        // Display fallback UI
        // this.setState({ hasError: true })
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }
    render() {
        return (
            <StrictMode>
                <div
                    id="app"
                    className={this.props.className}
                    data-custom-env-notexist={undefined}
                    data-custom-env-aaaaa={process.env.aaaaa}
                    data-custom-env-bbbbb={process.env.bbbbb}
                >
                    <Nav />
                    <Main children={this.props.children} />
                </div>
            </StrictMode>
        );
    }
}

export default App;
