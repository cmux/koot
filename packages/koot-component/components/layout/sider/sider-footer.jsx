import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

@KootExtend({
    styles: require('./sider-footer.module.less'),
})

class SiderFooter extends Component {

    static propTypes = {
        children: PropTypes.node 
    }

    render() {
        const { className } = this.props;
        const classes = classNames([
            className,
            'sider-footer'
        ]);
        return (
            <div className={classes}>
                {
                    this.props.children
                }
            </div>
        );
    }
}

export default SiderFooter;
