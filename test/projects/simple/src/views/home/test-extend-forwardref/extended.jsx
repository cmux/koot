import { memo } from 'react';
import { extend } from 'koot';

import styles from './extended.module.less';

// Functional Component =======================================================

const Extended = extend({
    connect: true,
    styles,
})(
    memo(({ forwardedRef, className, ...props }) => {
        if (__CLIENT__) console.warn('forwardedRef', forwardedRef, props);
        return (
            <div
                ref={forwardedRef}
                className={className}
                id="__test-extend_forward_ref"
            >
                Extended
            </div>
        );
    })
);

export default Extended;
