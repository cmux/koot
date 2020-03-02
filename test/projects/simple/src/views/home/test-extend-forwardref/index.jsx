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
        console.log('__ref__', this.refContainer.current);
        if (this.refContainer.current) {
            this.refContainer.current.classList.add('success');
            this.refContainer.current.innerHTML = 'Extended REF SUCCESS';
        }
    }

    render() {
        return <Extended ref={this.refContainer} />;
    }
}

export default TestExtendForwardref;
