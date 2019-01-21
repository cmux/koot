import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Tooltip } from 'antd';

/**
 * 判断显示内容是否省略
 * 如果省略则自动加上tooltip 提示
 */
class AutoTooltip extends Component {

    state = {
        overflow: false,
        visible: false,
    }

    ref = React.createRef();

    render(){
        const { props, state, ref, handleClick } = this;
        const { data, children } = props;
        const { visible } = state;
        return (
            <Tooltip 
                title={ data || children } 
                trigger="click" 
                visible={visible}
                overlayStyle={{'userSelect': 'text'}}
            >
                <span ref={ref} style={{'userSelect': 'text'}} onClick={handleClick}>{ data || children }</span>
            </Tooltip>
        )
    }

    componentDidMount() {
        this.clickOutsideHandler = window.addEventListener('click', this.onDocumentClick);
    }

    componentWillUnmount() {
        this.clickOutsideHandler && this.clickOutsideHandler.remove();
        this.clickOutsideHandler = null;
        window.removeEventListener('click', this.onDocumentClick);
    }

    onDocumentClick = (event) => {
        const target = event.target;
        const root = findDOMNode(this);
        const flag = this.contains(root, target);
        if (!flag) {
            this.hideTooltip();
        }
    }

    hideTooltip = () => {
        const { visible } = this.state;
        if( visible ){
            this.setState({
                visible: false
            })
        }
    }

    contains(root, n) {
        let node = n;
        while (node) {
            if (node === root) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    handleClick = () => {
        const node = this.ref.current  // 判断的dom节点，使用ref
        const clientWidth = node.clientWidth
        const scrollWidth = node.scrollWidth
        const offsetHeight = node.offsetHeight;
        const parentOffsetHeight = node.parentElement.offsetHeight;
        if (
            clientWidth < scrollWidth ||
            offsetHeight > parentOffsetHeight
        ) {
            // this.setState({    // 把是否溢出的状态存在state中，之后从state中拿值使用
            //     overflow: true    
            // })
            this.setState({
                visible: true
            })
        }
    }
}

export default AutoTooltip;