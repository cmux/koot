import { Component } from 'react';
import { renderTransfer } from './lib/core.js';
import { Form } from 'antd';
import PropTypes from 'prop-types';

@KootExtend({
    styles: require('./form.module.less'),
})

class FormComponent extends Component {

    static propTypes = {
        children: PropTypes.node,
        config: PropTypes.object.isRequired,
        onChange: PropTypes.func
    }

    render() {
        const { props } = this;
        const { config } = props;
        const nextConfig = Object.assign({}, config, {
            __rootProps: props
        })
        const form = renderTransfer(nextConfig)
        return form;
    }
}

export default Form.create({
    onValuesChange: (props, changedValues, allValues) => {
        props.onChange && props.onChange(allValues);
    }
})(FormComponent);
