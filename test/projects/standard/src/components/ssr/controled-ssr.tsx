import React from 'react';
import { extend, ExtendedProps } from 'koot';

const SSR: React.ComponentClass = extend({
    styles: require('./index.module.less')
})(({ className }) => (
    <div className={className} id="koot-test-controled-ssr">
        Alternative content
    </div>
));

//

@extend({
    ssr: <SSR />
})
class ControledSSR extends React.Component<ExtendedProps> {
    render() {
        return <div id="koot-test-controled-ssr">Controled SSR</div>;
    }
}

export default ControledSSR;
