import React, { Component } from 'react';
import { extend } from 'koot';
import classnames from 'classnames';

class Footer extends Component {
    render() {
        return (
            <div className={classnames('footer', this.props.className)}>
                <footer />
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Footer);
