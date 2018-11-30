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
        config: PropTypes.oneOfType([
            PropTypes.func.isRequired,
            PropTypes.object.isRequired
        ]),
        onChange: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.fieldStore = CreateFieldStore({}); 
        this.cacheDecoratorOnChangeBindFn = {};
    }

    render() {
        const { props } = this;
        const { config } = props;
        const formFieldValues = this.fieldStore.getFieldValues();
        const oldFormFieldValues = this.fieldStore.getOldFieldValues();
        const formData = Object.keys(formFieldValues).length === 0 ? undefined : formFieldValues;

        let nextConfig;
        if (typeof config === 'function') {
            nextConfig = config(formData, oldFormFieldValues);
        } else {
            nextConfig = config;
        }
        nextConfig = Object.assign({}, nextConfig, {
            __root: this,
            __rootProps: props
        })

        // const fieldValueObject = this.getFieldsValueObject(nextConfig);
        // this.oldFormData = formData;
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
            result[configObject.name] = configObject.defaultValue
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
            validateTrigger = trigger,
            valuePropName
        } = fieldOption;
        const inputProps = {
            [valuePropName]: this.fieldStore.getFieldValue(name)
        };
        if (trigger) {
            const fn = this.getCacheDecoratorOnChangeBindFn(name, trigger, this.decoratorOnChangeHandler);
            inputProps[trigger] = fn;
        }
        return inputProps
    }

    decoratorOnChangeHandler = (name, actionName, event) => {
        const value = event.target.value;
        this.setFields({
            [name]: value
        })
    }

    setFields = (fields, callback) => {
        this.fieldStore.setFields(fields);
        this.forceUpdate(callback);
    }

    getCacheDecoratorOnChangeBindFn = (name, actionName, fn) => {
        if (!this.cacheDecoratorOnChangeBindFn[name]) {
            this.cacheDecoratorOnChangeBindFn[name] = {};
        }
        const cacheItem = this.cacheDecoratorOnChangeBindFn[name];
        if (!cacheItem[actionName] || cacheItem[actionName].oriFn !== fn ) {
            cacheItem[actionName] = {
                fn: fn.bind(this, name, actionName),
                oriFn: fn,
            };
        }
        return cacheItem[actionName].fn;
    }
}

export default FormComponent;
