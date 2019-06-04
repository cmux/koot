import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Echarts from 'echarts';
import DataCenterTheme from './data-center.project.json';

@KootExtend({
    styles: require('./react-echarts.component.less'),
})
class ReactEcharts extends Component {

    static propTypes = {
        children: PropTypes.node,
        options: PropTypes.object,
        resize: PropTypes.any,
        onEvents: PropTypes.object
    }

    scoped = {
        timeId: null,
    }

    domContainer = undefined

    echartsInstance = undefined

    render() {
        // console.log('testtest')
        this.resizeEcharts();
        this.setEchartsOptions();
        const style = {}
        if( this.props.height ){
            style.height = this.props.height;
        }
        if( this.props.paddingBottom ){
            style.paddingBottom = this.props.paddingBottom;
        }
        return (
            <div className={this.props.className + ' react-echarts-wrapper'} style={style}>
                <div
                    className="chart-inner"
                >
                    <div
                        className="chart-instance"
                        ref={(domInstance) => {this.domContainer = domInstance}}
                    >
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.initEcharts();
    }

    componentWillUnmount() {
        // 组件销毁时，销毁echarts实例
        this.echartsInstance && this.echartsInstance.dispose();
        this.domContainer = undefined;
        this.removeResizeEvent();
        if( this.scoped.timeId ){
            clearTimeout(this.scoped.timeId);
        }
    }

    componentDidUpdate( prevProps ) {
        const newResizeWatchValue = this.props.resize;
        const oldResizeWatchValue = prevProps.resize;
        if( newResizeWatchValue !== oldResizeWatchValue ){
            this.resizeEcharts();
        }
    }

    initEcharts = () => {
        if( this.domContainer && !this.echartsInstance ){
            this.registerTheme();
            this.echartsInstance = Echarts.init(this.domContainer, 'data-center');
        }
        this.addResizeEvent();
        this.addEventsHandler();
        this.setEchartsOptions();
    }

    addEventsHandler = () => {
        if( !this.echartsInstance ){
            return;
        }
        const events = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout', 'globalout', 'contextmenu'];
        events.forEach(event => {
            const eventName = `on${event.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())}`;
            if( this.props[eventName] ){
                this.echartsInstance.on(event, (...args) => {
                    this.props[eventName](...args);
                })
            }
        })
    }

    registerTheme = () => {
        if( !Echarts ){
            return;
        }
        Echarts.registerTheme(DataCenterTheme.themeName, DataCenterTheme.theme);
    }

    setEchartsOptions = (option) => {
        let nextOption = option || this.props.options;
        this.echartsInstance && nextOption && this.echartsInstance.setOption(nextOption, true);
    }

    addResizeEvent = () => {
        // 注册事件
        if(typeof window !== 'undefined'){
            const { handleResizeEcharts } = this;
            window.addEventListener('resize', handleResizeEcharts)
            window.addEventListener('animationend', handleResizeEcharts)
            window.addEventListener('transitionend', handleResizeEcharts)
        }
    }

    removeResizeEvent = () => {
        // 移除事件
        if(typeof window !== 'undefined'){
            const { handleResizeEcharts } = this;
            window.removeEventListener('resize', handleResizeEcharts)
            window.removeEventListener('animationend', handleResizeEcharts)
            window.removeEventListener('transitionend', handleResizeEcharts)
        }
    }

    handleResizeEcharts = () => {
        if( this.scoped.timeId ){
            clearTimeout(this.scoped.timeId);
        }
        this.scoped.timeId = setTimeout(() => {
            this.resizeEcharts();
            clearTimeout(this.scoped.timeId);
        }, 300)
    }

    /**
     * 自适应字体大小
     * xAxis[index].axisLabel.fontSize
     * yAxis[index].axisLabel.fontSize
     */
    adaptiveFontSize = ( option, width ) => {
        const { xAxis = [], yAxis = [], adaptive = false } = option;
        if( !adaptive ){
            xAxis.map(xAxisItem => {
                // 自适应文字处理
                const fontSize = xAxisItem.axisLabel.fontSize;
                if( fontSize && width < 1080 ){
                    xAxisItem.axisLabel.fontSize = width/1080*12;
                }
                return xAxisItem;
            })
            yAxis.map(yAxisItem => {
                // 自适应文字处理
                const fontSize = yAxisItem.axisLabel.fontSize;
                if( fontSize && width < 1080 ){
                    yAxisItem.axisLabel.fontSize = width/1080*12;
                }
                return yAxisItem;
            })
            return Object.assign({}, option, {
                xAxis,
                yAxis
            })
        }
    }
    /**
     * 自适应x轴文字旋转角度
     * xAxis[index].axisLabel.rotate
     */
    adaptiveRotate = () => {

    }

    resizeEcharts = () => {
        const { echartsInstance, domContainer } = this;
        // 当能有效获取 domContainer 的 width 时重新计算
        // 避免 当 domContainer display:none 时，echart 被默认重置为 100x100 大小
        if( echartsInstance && domContainer && domContainer.offsetWidth !== 0 ){
            // 自适应相关处理
            const option = echartsInstance.getOption();
            if( option ){
                const width = domContainer.offsetWidth;
                const nextOption = this.adaptiveFontSize(option, width);
                this.setEchartsOptions(nextOption)
            }
            echartsInstance.resize();
        }
    }
}

export default ReactEcharts;
