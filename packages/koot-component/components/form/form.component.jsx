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
        config: PropTypes.oneOfType([
            PropTypes.func.isRequired,
            PropTypes.object.isRequired
        ]),
        onChange: PropTypes.func
    }

    render() {
        const { props } = this;
        const { config } = props;
        const formFieldsValue = props.form.getFieldsValue();
        const formData = Object.keys(formFieldsValue).length === 0 ? undefined : formFieldsValue;
        let nextConfig;
        if( typeof config === 'function' ){
            nextConfig = config(formData);
        }else{
            nextConfig = config;
        }
        nextConfig = Object.assign({}, nextConfig, {
            __rootProps: props
        })
        return renderTransfer(nextConfig);
    }
}

export default Form.create({
    onValuesChange: (props, changedValues, allValues) => {
        const { onChange } = props;
        onChange && typeof onChange === 'function' && onChange(allValues);
    }
})(FormComponent);
