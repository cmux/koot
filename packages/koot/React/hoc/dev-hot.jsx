import { hot } from 'react-hot-loader';
import { forwardRef } from 'react';

export default (theModule) => (WrappedComponent) => {
    if (!WrappedComponent.__KOOT_HOT__) {
        const Hot = hot(theModule)(WrappedComponent);
        WrappedComponent.__KOOT_HOT__ = forwardRef((props, ref) => {
            if (ref) return <Hot {...props} forwardedRef={ref} />;
            return <Hot {...props} />;
        });
    }
    return WrappedComponent.__KOOT_HOT__;
};
