import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'mini-store';

@KootExtend({
    styles: require('./header.module.less'),
})
@connect((state) => ({
    isHide: state.isHide,
}))
class Header extends Component {

    static propTypes = {
        children: PropTypes.node 
    }

    element = undefined
    
    render() {
        const { isHide } = this.props;
        let translateY = 0;
        if( this.element ){
            translateY = isHide ? this.element.offsetHeight : 0;
        }
        const style = {
            transform: `translateY(-${translateY}px)`
        }
        return (
            <div 
                className={this.props.className}
                ref={ element => this.element = element }
                style={style}
            >
                {
                    this.props.children
                }
            </div>
        );
    }

    componentDidMount() {
        this.setState({
            scrollOffset: this.element.offsetHeight
        })
    }
}

export default Header;
