import React, { Component } from 'react';
import { renderTransfer } from './lib/core.js';
import PropTypes from 'prop-types';
import CreateFieldStore from './lib/create-field-store.js';

@KootExtend({
    styles: require('./form.module.less'),
})
class FormComponent extends Component {

    static propTypes = {
        children: PropTypes.node,
        onChange: PropTypes.func,
        render: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.fieldStore = CreateFieldStore(); 
        this.cacheDecoratorOnChangeBindFn = {};
    }

    render() {
        const { props } = this;
        const { render } = props;
        const formFieldValues = this.fieldStore.getFieldValues();
        const oldFormFieldValues = this.fieldStore.getOldFieldValues();
        const formData = Object.keys(formFieldValues).length === 0 ? undefined : formFieldValues;
        const oldFormData = Object.keys(oldFormFieldValues).length === 0 ? formData : oldFormFieldValues;
        
        const config = render(formData, oldFormData);
       
        const nextConfig = Object.assign({}, config, {
            __root: this,
            __rootProps: props
        })

        return renderTransfer(nextConfig);
    }

    equal = (object1, object2) => {
        const object1keys = Object.keys(object1);
        const object2keys = Object.keys(object2);
        if (object1keys.length !== object2keys.length) {
            return false;
        } else {
            for (let index = 0; index < object1keys.length; index++) {
                const key = object1keys[index];
                const value1 = object1[key];
                const value2 = object2[key];
                if (value1 !== value2) {
                    return false;
                }
            }
        }
        return true;
    }

    getFieldsValueObject = (configObject) => {
        let result = {}
        if (configObject &&
            'name' in configObject &&
            'value' in configObject
        ) {
            if( Array.isArray(configObject.name) && Array.isArray(configObject.value) ){
                configObject.name.forEach((nameItem, index) => {
                    result[nameItem] = configObject.value[index];
                })
            }else{
                result[configObject.name.toString()] = configObject.value
            }
        }
        if (configObject.children && configObject.children.length > 0) {
            const len = configObject.children.length;
            const list = configObject.children;
            for (let index = 0; index < len; index++) {
                const element = list[index];
                const childrenResult = this.getFieldsValueObject(element);
                result = Object.assign({}, result, childrenResult)
            }
        }
        return result;
    }

    fieldDecorator = (name, fieldOption) => {
        const inputProps = this.getDecoratorProps(name, fieldOption);
        return (fieldElem) => {
            const oriProps = fieldElem.props;
            this.fieldStore.setFieldMeta(name.toString(), {
                oriProps
            })
            return React.cloneElement(fieldElem, {
                ...inputProps
            })
        }
    }

    getDecoratorProps = (name, userFieldOption) => {
        const fieldOption = {
            name,
            trigger: 'onChange',
            valuePropName: 'value',
            ...userFieldOption
        }
        const {
            trigger,
            valuePropName
        } = fieldOption;

        const inputProps = {
            [valuePropName]: userFieldOption[valuePropName] || this.fieldStore.getFieldValue(name.toString())
        };

        if (trigger) {
            const fn = this.getCacheDecoratorOnChangeBindFn(name, trigger, this.decoratorOnChangeHandler);
            inputProps[trigger] = fn;
        }

        return inputProps
    }

    getValueFromEvent(e) {
        // To support custom element
        if (!e || !e.target) {
            return e;
        }
        const { target } = e;
        return target.type === 'checkbox' ? target.checked : target.value;
    }

    getCacheDecoratorOnChangeBindFn = (name, actionName, fn) => {
        if (!this.cacheDecoratorOnChangeBindFn[name.toString()]) {
            this.cacheDecoratorOnChangeBindFn[name.toString()] = {};
        }
        const cacheItem = this.cacheDecoratorOnChangeBindFn[name.toString()];
        if (!cacheItem[actionName] || cacheItem[actionName].oriFn !== fn ) {
            cacheItem[actionName] = {
                fn: fn.bind(this, name, actionName),
                oriFn: fn,
            };
        }
        return cacheItem[actionName].fn;
    }

    decoratorOnChangeHandler = (name, actionName, event) => {
        const fieldMeta = this.fieldStore.getFieldMeta(name.toString());
        const value = this.getValueFromEvent(event);
        const { oriProps } = this.fieldStore.getFieldMeta(name.toString());
        if( oriProps[actionName] ){
            oriProps[actionName](event);
        }
        let resultObject = {};
        if( Array.isArray(name) && Array.isArray(value) ){
            name.forEach((nameItem, index) => {
                let nextValue = value[index];
                if( nextValue && 
                    typeof nextValue['format'] === 'function' && 
                    fieldMeta.oriProps && 
                    fieldMeta.oriProps.format 
                ){
                    nextValue = nextValue.format(fieldMeta.oriProps.format)
                }
                resultObject[nameItem] = nextValue;
            })
        }else{
            let nextValue = value;
            if( nextValue && 
                typeof nextValue['format'] === 'function' && 
                fieldMeta.oriProps && 
                fieldMeta.oriProps.format 
            ){
                nextValue = nextValue.format(fieldMeta.oriProps.format)
            }
            resultObject[name.toString()] = nextValue;
        }
        this.setFields(resultObject);
    }

    setFields = (fields, callback) => {
        const { onChange } = this.props;
        this.fieldStore.setFields(fields);
        if( onChange ){
            const formData = this.fieldStore.getFieldValues();
            onChange(formData)
        }
        this.forceUpdate(callback);
    }
}

export default FormComponent;
