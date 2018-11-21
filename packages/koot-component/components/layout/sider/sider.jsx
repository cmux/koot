import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

@KootExtend({
    styles: require('./sider.module.less'),
})

class Sider extends Component {

    static propTypes = {
        children: PropTypes.node,
        collapsed: PropTypes.bool, 
    }

    render() {
        const { className, collapsed } = this.props;
        const classes = classNames([
            className,
            'sider-wrapper',
            {
                ['sider-collapsed']: collapsed
            }
        ]);
        return (
            <div className={classes}>
                <div className="sider-inner">
                    {
                        this.props.children
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        collapsed: state.SiderModule.collapsed
    }
}

export default connect(mapStateToProps)(Sider);
