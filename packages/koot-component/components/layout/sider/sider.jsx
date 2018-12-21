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
    }

    constructor(props) {
        super(props)

        this.store = create({
            collapsed: false,
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
            this.forceUpdate();
        }) 
    }
}

export default Sider;
