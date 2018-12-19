import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'mini-store';

@KootExtend({
    styles: require('./sider-switch.module.less'),
})
@connect((state) => ({
    collapsed: state.collapsed,
}))
class SiderSwitch extends Component {

    static propTypes = {
        children: PropTypes.node,
        onChange: PropTypes.func,
        dispatch: PropTypes.func,
        collapsed: PropTypes.bool,
    }

    render() {
        const { className, collapsed } = this.props;
        const classes = classNames([
            className,
            `sider-switch-wrapper`,
            {
                [`slider-off`]: collapsed
            },
        ])
        return (
            <div 
                className={classes} 
                onClick={this.siderSwitchClickHandler}
            >
                <i className="switch">
                    {
                        this.props.children
                    }
                </i>
            </div>
        );
    }

    siderSwitchClickHandler = () => {
        this.props.store.setState({
            collapsed: !this.props.collapsed
        })
    }
}

export default SiderSwitch;
