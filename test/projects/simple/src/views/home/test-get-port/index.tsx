import React from 'react';
import { extend } from 'koot';
import getPort from 'koot/utils/get-port';

import styles from './index.module.less';

// ============================================================================

interface ComponentProps {
    customProps?: string;
}

// Functional Component =======================================================

const TestGetPort = extend<ComponentProps>({
    styles
})(
    React.memo(
        ({ className, children }): JSX.Element => {
            return (
                <React.Fragment>
                    <h3>Test: async/await</h3>
                    <div id="__test-get-port">{getPort()}</div>
                </React.Fragment>
            );
        }
    )
);

export default TestGetPort;
