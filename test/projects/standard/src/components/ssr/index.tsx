import React from 'react';
import { extend, ExtendedProps } from 'koot';

import NoSSR from './no-ssr';
import Controled from './controled-ssr';

@extend({
    styles: require('./index.module.less')
})
class SSRSamples extends React.Component<ExtendedProps> {
    render(): React.ReactNode {
        return (
            <div className={this.props.className} id="koot-test-ssr">
                <NoSSR />
                <Controled />
            </div>
        );
    }
}

export default SSRSamples;
