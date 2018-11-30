import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'mini-store';

@KootExtend({
    styles: require('./content-inner.module.less'),
})
@connect((state) => ({
    scrollOffset: state.scrollOffset,
    isHide: state.isHide
}))
class Content extends Component {

    static propTypes = {
        children: PropTypes.node
    }

    element = undefined;

    scroll = {
        scrolling: false,
        previousTop: 0,
        previousTime: 0,
    }

    render() {
        const { onScrollHandler } = this;
        return (
            <div 
                ref={ element => this.element = element }
                className={this.props.className}
                onScrollCapture={onScrollHandler}
            >
                <div className="layout-content-body">
                    {
                        this.props.children
                    }
                </div>
            </div>
        );
    }

    isNeedHideHeader = ( currentTop, currentTime ) => {
        const { previousTop, previousTime } = this.scroll;
        const { scrollOffset, isHide } = this.props;
        const distance = currentTop - previousTop;
        // 内容滚动方向
        const direction = distance > 0 ? 'TOP' : 'BOT';
        const distanceAbs = Math.abs(distance);
        const costTime = currentTime - previousTime;

        if( direction === 'TOP' ){
            return true;
        }
        if( direction === 'BOT' ){
            // 向下滑动
            // 快速向下滚动时显示
            if( 
                // 滚动速度大于 0.03
                distanceAbs/costTime > 0.5 ||
                currentTop < scrollOffset
            ){
                return false;
            }
            // 已经显示的时候
            if( isHide === false ){
                return false;
            }
            // 滚动条剩余距离不足时候 显示
            if( currentTop < scrollOffset ){
                return false;
            }
            return true;
        }
    }

    autoHideHeader = () => {
        const currentTop = this.element.scrollTop;
        const currentTime = new Date().getTime();
        // 计算是否需要隐藏
        const isHide = this.isNeedHideHeader(currentTop, currentTime);
        this.props.store.setState({
            isHide
        })
        this.scroll.previousTop = currentTop;
        this.scroll.previousTime = currentTime;
        this.scroll.scrolling = false;
    }

    onScrollHandler = () => {
        if( !this.scroll.scrolling ){
            this.scroll.scrolling = true;
            if(typeof window !== 'undefined'){
                if(!window.requestAnimationFrame){
                    this.timeId = setTimeout(() => {
                        this.autoHideHeader();
                    }, 250);
                }else{
                    requestAnimationFrame(this.autoHideHeader.bind(this))
                }
            }
        }
    }
}

export default Content;
