import { StrictMode } from 'react';
import { extend } from 'koot';
import classNames from 'classnames';

import Nav from '@components/nav';

import styles from './app.module.less';

// ============================================================================

const App = extend({
    styles,
})(({ className, children, location, ...props }) => (
    <StrictMode>
        <div
            className={classNames([
                className,
                {
                    'is-home':
                        location.pathname === '' || location.pathname === '/',
                },
            ])}
        >
            <Nav location={location} {...props} />
            <Main children={children} />
        </div>
    </StrictMode>
));
export default App;

// ============================================================================

const Main = (props) => <main {...props} />;
