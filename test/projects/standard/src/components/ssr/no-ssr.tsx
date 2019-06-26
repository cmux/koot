import React from 'react';
import { extend } from '../../../../../../packages/koot/index';

const NoSSR: React.ComponentClass = extend({
    ssr: false
})(() => <div id="koot-test-no-ssr">No SSR</div>);

export default NoSSR;
