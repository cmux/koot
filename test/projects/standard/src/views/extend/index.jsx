import { Component } from 'react';
import { extend } from 'koot';

import {
    updateServerTimestamp,
    resetServerTimestamp,
} from '@store/infos/actions';

if (__CLIENT__) console.log('!:!:! KOOT TEST VIEW: EXTEND PAGE !:!:!');

// console.log((typeof Store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' Store in [PageExtend]')
const check = (props) => {
    if (props.serverTimestamp) return true;
};

// console.log('PageExtend extend', extend)
@extend({
    connect: (state) => ({
        localeId: state.localeId,
        serverTimestamp: state.infos.serverTimestamp,
    }),
    pageinfo: (/*state, renderProps*/) => ({
        title: `${__('pages.extend.title')} - ${__('title')}`,
        metas: [
            { description: __('pages.extend.description') },
            { 'page-name': 'extend' },
        ],
    }),
    styles: require('./styles.less'),

    // data: {
    //     fetch: (state, renderProps, dispatch) =>
    //         new Promise(resolve => {
    //             dispatch(updateServerTimestamp());
    //             setTimeout(() => resolve(), 200);
    //         }),
    //     check: (state, renderProps) => {
    //         console.log(renderProps);
    //         return !!renderProps.serverTimestamp;
    //     }
    // },

    data: (state, renderProps, dispatch) => {
        if (check(renderProps)) return true;
        return Promise.all([
            dispatch(updateServerTimestamp()),
            new Promise((resolve) => {
                setTimeout(() => resolve(), 100);
            }),
        ]);
    },

    name: 'PageExtend',
})
class PageExtend extends Component {
    reset = false;

    componentDidMount() {
        console.log('PageExtend mount');
        if (!this.reset && !this.props.serverTimestamp) {
            this.props.dispatch(updateServerTimestamp());
        }
    }

    componentWillUnmount() {
        this.props.dispatch(resetServerTimestamp());
        this.reset = true;
    }

    render() {
        if (!check(this.props)) return <div>LOADING...</div>;

        if (__CLIENT__)
            console.log('!:!:! KOOT TEST VIEW: EXTEND PAGE | TEST 2 !:!:!');
        // console.log((typeof Store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' Store in [PageExtend] render')
        return (
            <div className={this.props.className}>
                <h2>props.localeId</h2>
                <p>{this.props.localeId}</p>
                <h2>{__('pages.extend.isomorphic')}</h2>
                <p className="timestamp">
                    Server Time:{' '}
                    <strong>
                        {new Date(this.props.serverTimestamp).toISOString()}
                    </strong>
                </p>
                <p>{__('pages.extend.isomorphic_content')}</p>
            </div>
        );
    }
}

export default PageExtend;
