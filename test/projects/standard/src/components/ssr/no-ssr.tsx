import { ComponentClass } from 'react';
import { extend } from 'koot';

const NoSSR: ComponentClass = extend({
    ssr: false,
})(() => <div id="koot-test-no-ssr">No SSR</div>);

export default NoSSR;
