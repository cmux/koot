import { Component, ComponentClass, ReactNode } from 'react';
import { extend, ExtendedProps } from 'koot';

const SSR: ComponentClass = extend({
    styles: require('./index.module.less'),
})(({ className }) => (
    <div className={className} id="koot-test-controled-ssr">
        Alternative content
    </div>
));

//

@extend({
    ssr: <SSR />,
})
class ControledSSR extends Component<ExtendedProps> {
    render(): ReactNode {
        return <div id="koot-test-controled-ssr">Controled SSR</div>;
    }
}

export default ControledSSR;
