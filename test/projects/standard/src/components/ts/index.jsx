import React from 'react';
import { extend } from 'koot';

import {
    updateServerTimestamp,
    resetServerTimestamp,
} from '@store/infos/actions';

const check = (props) => {
    if (props.serverTimestamp) return true;
};

@extend({
    connect: (state) => ({
        serverTimestamp: state.infos.serverTimestamp,
    }),

    data: (state, renderProps, dispatch) => {
        if (check(renderProps)) return true;
        return Promise.all([
            dispatch(updateServerTimestamp()),
            new Promise((resolve) => {
                setTimeout(() => resolve(), 100);
            }),
        ]);
    },
})
class TS extends React.Component {
    // componentDidMount() {
    //     console.log('componentDidMount', this.props)
    //     if (check(this.props)) return
    //     this.props.dispatch(updateServerTimestamp())
    // }

    componentWillUnmount() {
        this.props.dispatch(resetServerTimestamp());
    }

    render() {
        if (!check(this.props)) return <div>LOADING...</div>;

        if (__CLIENT__) console.log('ts', this.props);

        return <div children={this.props.serverTimestamp} />;
    }
}

export default TS;
