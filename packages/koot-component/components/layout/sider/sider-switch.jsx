import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

@KootExtend({
    styles: require('./sider-switch.module.less'),
})
class SiderSwitch extends Component {

    static propTypes = {
        children: PropTypes.node,
        onChange: PropTypes.func,
        dispatch: PropTypes.func,
        collapsed: PropTypes.bool,
    }

    constructor() {
        super();
    }

    componentDidMount() {
        // console.info('SiderSwitch.componentDidMount',this.props)
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
        this.props.dispatch(ActionTypes.TOGGLE_COLLAPSED)
    }
}

const mapStateToProps = state => {
    return {
        collapsed: state.siderModule.collapsed
    }
}

export default connect(mapStateToProps)(SiderSwitch);
