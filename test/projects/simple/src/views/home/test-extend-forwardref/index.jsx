import React from 'react';
import { extend } from 'koot';

import Extended from './extended';

import styles from './index.module.less';

// ============================================================================

@extend({
    connect: true,
    styles: styles,
})
class TestExtendForwardref extends React.PureComponent {
    refContainer = React.createRef();

    addClassToRef() {
        console.warn('__ref__', this.refContainer.current);
        if (
            this.refContainer.current &&
            this.refContainer.current instanceof HTMLElement
        ) {
            this.refContainer.current.classList.add('success');
            this.refContainer.current.innerHTML = 'Extended REF SUCCESS';
        }
    }

    componentDidMount() {
        this.addClassToRef();
    }

    componentDidUpdate() {
        this.addClassToRef();
    }

    render() {
        return (
            <div>
                {/* 456 */}
                <input />
                <Extended ref={this.refContainer} />
            </div>
        );
    }
}

export default TestExtendForwardref;
