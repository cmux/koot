import React, { Component } from 'react';
import { extend } from 'koot';

class NotFound extends Component {
    render() {
        return (
            <div className={this.props.className}>
                <h1>404</h1>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(NotFound);
