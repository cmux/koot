import React from 'react';
import { extend } from 'koot';

import Extended from './extended';

import styles from './index.module.less';

// ============================================================================

@extend({
    connect: true,
    styles: styles
})
class TestExtendForwardref extends React.PureComponent {
    refContainer = React.createRef();

    componentDidMount() {
        console.log('__ref__', this.refContainer, this.refContainer.current);
        // setTimeout(() => {
        //     console.log(
        //         '__ref__',
        //         this.refContainer,
        //         this.refContainer.current
        //     );
        // }, 1000);
        if (this.refContainer.current && this.refContainer.current.classList) {
            this.refContainer.current.classList.add('success');
            this.refContainer.current.innerHTML = 'Extended REF SUCCESS';
        }
    }

    render() {
        // if (__CLIENT__) window.__KOOT_DEV__.container = this.refContainer;
        return <Extended ttt="aaa" ref={this.refContainer} />;
    }
}

export default TestExtendForwardref;
