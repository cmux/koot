import { Component } from 'react';
import { extend } from 'koot';

import { fetchAppName } from '@store/test-modify-state/actions';

// console.log((typeof Store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' Store in [PageExtend]')
const check = (props) => {
    if (props.testState) return true;
};

// console.log('PageExtend extend', extend)
@extend({
    connect: (state) => ({
        testState: state.testModifyState,
    }),
    pageinfo: (/*state, renderProps*/) => ({
        title: `${__('title')}`,
        metas: [{ 'page-name': 'test-modify-state' }],
    }),
    styles: require('./styles.less'),

    data: (state, renderProps, dispatch) => {
        if (check(renderProps)) return true;
        dispatch(fetchAppName());
        return new Promise((resolve) => {
            setTimeout(() => resolve(), 100);
        });
    },

    name: 'PageTestModifyState',
})
class PageTestModifyState extends Component {
    render() {
        if (!check(this.props)) return <div>LOADING...</div>;

        return (
            <div className={this.props.className}>
                <h2>RANDOM</h2>
                <p>{this.props.testState}</p>
            </div>
        );
    }
}

export default PageTestModifyState;
