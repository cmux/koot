import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Provider, create } from 'mini-store';

@KootExtend({
    styles: require('./sider.module.less'),
})
class Sider extends Component {

    static propTypes = {
        children: PropTypes.node,
        collapsed: PropTypes.bool, 
        onCollapsedChange: PropTypes.func
    }

    constructor(props) {
        super(props)

        const { collapsed } = this.props;

        this.store = create({
            collapsed: collapsed || false,
        })
    }

    render() {
        const { className } = this.props;
        const state = this.store.getState();
        const { collapsed } = state;
        const classes = classNames([
            className,
            'sider-wrapper',
            {
                ['sider-collapsed']: collapsed
            }
        ]);
        return (
            <Provider store={this.store}>
                <div className={classes}>
                    <div className="sider-inner">
                        {
                            this.props.children
                        }
                    </div>
                </div>
            </Provider>
        );
    }

    componentDidMount() {
        this.store.subscribe(() => {
            const { collapsed } = this.store.getState();
            this.props.onCollapsedChange && 
            typeof this.props.onCollapsedChange === 'function' && 
            this.props.onCollapsedChange(collapsed)
            this.forceUpdate();
        }) 
    }
}

export default Sider;
