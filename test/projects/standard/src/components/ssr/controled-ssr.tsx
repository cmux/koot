import React from 'react';
import { extend } from 'koot';

const SSR: React.ComponentClass = extend({
    styles: require('./index.module.less')
})(({ className }) => (
    <div className={className} id="koot-test-controled-ssr">
        Alternative content
    </div>
));

//

const ControledSSR: React.ComponentClass = extend({
    ssr: <SSR />
})(() => <div id="koot-test-controled-ssr">Controled SSR</div>);

export default ControledSSR;
