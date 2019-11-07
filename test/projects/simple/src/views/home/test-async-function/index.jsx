import React from 'react';
import { extend } from 'koot';

import styles from './index.module.less';

// Functional Component =======================================================

@extend({
    styles
})
class TestAsyncFunction extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            valueAsyncAwait: 0
        };
        this.testAsyncAwait = this.testAsyncAwait.bind(this);
    }
    async testAsyncAwait() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.setState(prevState => ({
            valueAsyncAwait: prevState.valueAsyncAwait + 1
        }));
    }
    render() {
        return (
            <React.Fragment>
                <h3>Test: async/await</h3>
                <div id="__test-async_await">
                    <button
                        type="button"
                        data-role="button"
                        onClick={this.testAsyncAwait}
                    >
                        TEST
                    </button>
                    <span data-role="value">{this.state.valueAsyncAwait}</span>
                </div>
            </React.Fragment>
        );
    }
}

export default TestAsyncFunction;
