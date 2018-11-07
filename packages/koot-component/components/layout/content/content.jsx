import React, { Component } from 'react';
import PropTypes from 'prop-types';

@KootExtend({
    styles: require('./content.module.less'),
})

class Content extends Component {

    static propTypes = {
        children: PropTypes.node
    }

    render() {
        return (
            <div className={this.props.className}>
                {
                    this.props.children
                }
            </div>
        );
    }
}

export default Content;
