import React, { Component } from 'react';
import PropTypes from 'prop-types';

@KootExtend({
    styles: require('./sider-header.module.less'),
})

class SiderHeader extends Component {

    static propTypes = {
        children: PropTypes.node 
    }

    render() {
        return (
            <div className={this.props.className + ' sider-header'}>
                <div className="sider-header-inner">
                    {
                        this.props.children
                    }
                </div>
            </div>
        );
    }
}

export default SiderHeader;
