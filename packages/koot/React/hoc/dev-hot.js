import { hot } from 'react-hot-loader';
import React from 'react';

export default theModule => WrappedComponent => {
    const Hot = hot(theModule)(WrappedComponent);
    return React.forwardRef((props, ref) => {
        if (ref) return <Hot {...props} forwardedRef={ref} />;
        return <Hot {...props} />;
    });
};
