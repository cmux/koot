import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, create } from 'mini-store';

@KootExtend({
    styles: require('./content.module.less'),
})

class Content extends Component {

    static propTypes = {
        children: PropTypes.node
    }

    constructor(props) {
        super(props);

        this.store = create({
            isHide: false,
            scrollOffset: 56
        })
    }

    render() {
        return (
            <Provider store={this.store}>
                <div className={this.props.className}>
                    {
                        this.props.children
                    }
                </div>
            </Provider>
            
        );
    }
}

export default Content;
