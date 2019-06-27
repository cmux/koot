import React from 'react';
import { extend } from 'koot';

import NoSSR from './no-ssr';
import Controled from './controled-ssr';

const SSRSamples: React.ComponentClass = extend({
    styles: require('./index.module.less')
})(({ className }) => (
    <div className={className} id="koot-test-ssr">
        <NoSSR />
        <Controled />
    </div>
));

export default SSRSamples;
