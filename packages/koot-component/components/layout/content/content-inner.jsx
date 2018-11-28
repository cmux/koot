import React, { Component } from 'react';
import PropTypes from 'prop-types';

@KootExtend({
    styles: require('./content-inner.module.less'),
})

class Content extends Component {

    static propTypes = {
        children: PropTypes.node
    }

    element = undefined;

    scrollEvent = {
        start: 0,
        direction: 'bottom',
        timer: null,
        flag: false,
        distance: 0
    }

    render() {
        const { onScrollHandler } = this;
        return (
            <div 
                ref={ element => this.element = element }
                className={this.props.className} 
                onScrollCapture={onScrollHandler}
            >
                <div className="content-body">
                    {
                        this.props.children
                    }
                </div>
            </div>
        );
    }

    onScrollHandler = () => {
        const currentScroll = this.element.scrollTop;

        if( !this.scrollEvent.flag ){
            this.scrollEvent.flag = true;
            this.scrollEvent.start = currentScroll;
        }else{
            const distance = currentScroll - this.scrollEvent.start;
            console.info('distance', distance)
        }

        this.scrollEvent.timer && clearTimeout(this.scrollEvent.timer);
        this.scrollEvent.timer = setTimeout(() => {
            this.scrollEvent.start = 0;
            this.scrollEvent.flag = false;
            this.scrollEvent.distance = 0;
            this.scrollEvent.timer && clearTimeout(this.scrollEvent.timer);
        }, 200)
        
        console.info( [this.element] )
    }
}

export default Content;
