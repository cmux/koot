import React, { Component } from 'react';
import { Tooltip } from 'antd';

/**
 * 判断显示内容是否省略
 * 如果省略则自动加上tooltip 提示
 */
class AutoTooltip extends Component {

    state = {
        overflow: false
    }

    ref = React.createRef();

    render(){
        const { props, state, ref } = this;
        const { data, children } = props;
        const { overflow } = state;
        if( overflow ){
            return (
                <Tooltip 
                    title={data || children} 
                    trigger="click" 
                    getPopupContainer = {triggerNode  => (triggerNode)}
                >
                    <span ref={ref} style={{'userSelect': 'text'}}>{ data || children }</span>
                </Tooltip>
            )
        }
        return (
            <span ref={ref}>{ data || children }</span>
        )
    }

    componentDidMount() {
        const node = this.ref.current  // 判断的dom节点，使用ref
        const clientWidth = node.clientWidth
        const scrollWidth = node.scrollWidth
        const offsetHeight = node.offsetHeight;
        const parentOffsetHeight = node.parentElement.offsetHeight;
        if (
            clientWidth < scrollWidth ||
            offsetHeight > parentOffsetHeight
        ) {
            this.setState({    // 把是否溢出的状态存在state中，之后从state中拿值使用
                overflow: true    
            })
        }
    }
}

export default AutoTooltip;