import React, { Fragment } from 'react';
import { extend } from 'koot';

import styles from './styles.component.less';

// https://github.com/cmux/koot/issues/68

const Issue68 = extend({
    styles,
})(({ className }) => {
    return (
        <Fragment>
            <div className={className} data-issue="68">
                <h4>Issue 68</h4>
                <div className="component" koot-test-styles="font-size: 20px">
                    .component .component
                </div>
                <div className="wrapper">
                    <div
                        className="component"
                        koot-test-styles="font-size: 20px; font-weight: 900"
                    >
                        .component .wrapper .component
                    </div>
                </div>
            </div>
            <div></div>
            <div className={className} koot-test-styles="color: #0088bb">
                .component ~ .component
            </div>
            <div
                className={className}
                koot-test-styles="color: #0088bb; font-style: italic"
            >
                .component + .component
            </div>
            <div
                className={className}
                data-a=".component"
                koot-test-styles="color: #008800; font-style: italic"
            >
                .component[data-a=".component"]
            </div>
        </Fragment>
    );
});

export default Issue68;
