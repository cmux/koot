import React from 'react';
import { Form, Row, Col, Input, Button, TimePicker, DatePicker, Select, Switch, Checkbox, Radio} from 'antd';
import { renderChildrenHandler, isNeedWrapFormItem, getKey, getName } from './core.js';
import { getConfigItemProps } from './props.js';
import { onSubmitHandler } from './event.js';
import Upload from './componnets/upload.component.jsx';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const TextArea = Input.TextArea;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

/**
 * antd Form.getFieldDecorator 包装模版函数
 * 
 * @param {*} configItem 
 * @param {*} reactDom 
 */
const antdFieldDecorator = ( configItem, reactDom ) => {
    const { value, __root } = configItem;
    // const { getFieldDecorator } = __rootProps.form;
    const name = getName(configItem);  
    const finalComponent = __root.fieldDecorator(
        name,
        {
            // ... props
            value: value
        }
    )(reactDom)
    return finalRenderHandler(configItem, finalComponent);
}

/**
 * 渲染 antd Form 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderFormHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return (
        <Form
            {...props}
        >
            {
                renderChildrenHandler(configItem)
            }
        </Form>
    )
}

/**
 * 渲染 antd FormItem 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderFormItemHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return (
        <FormItem 
            {...props}
        >
            {
                renderChildrenHandler(configItem)
            }
        </FormItem>
    )
}

/**
 * 渲染 antd Row 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderRowHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return (
        <Row 
            {...props}
        >
            {
                renderChildrenHandler(configItem)
            }
        </Row>
    )
}

/**
 * 渲染 antd Col 组件处理函数
 * 
 * @param {Object} configItem json配置单元
 */
export const renderColHandler = (configItem = {}) => {
    const { __parent } = configItem;
    const count = __parent.children.length;
    const props = getConfigItemProps(configItem);
    props.span = props.span || parseInt(24/count)
    return (
        <Col 
            {...props}
        >
            {
                renderChildrenHandler(configItem)        
            }
        </Col>
    )
}

/**
 * 渲染 antd Input 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderInputHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return antdFieldDecorator(
        configItem, 
        (
            <Input 
                {...props}
            >
            </Input>
        )
    )
}

/**
 * 渲染 antd TextArea 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderTextAreaHandler  = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return antdFieldDecorator(
        configItem, 
        (
            <TextArea 
                {...props}
            >
            </TextArea>
        )
    )
}

/**
 * 渲染 antd input[type=password] 组件
 * 
 * @param {Obejct} configItem  json配置单元
 */
export const renderPasswordHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return antdFieldDecorator(
        configItem, 
        (
            <Input 
                {...props}
            >
            </Input>
        )
    )
}

/**
 * 渲染 antd InputGroup 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderInputGroupHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return (
        <InputGroup 
            {...props}
        >
            {
                renderChildrenHandler(configItem)
            }
        </InputGroup>
    )
}

/**
 * 渲染 antd Button 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderButtonHandler = (configItem = {}) => {
    const { label } = configItem;
    const props = getConfigItemProps(configItem);
    return (
        <Button
            {...props}
        >
            { label }
        </Button>
    )
}

/**
 * 渲染 antd TimePicker  组件
 * 
 * @param {Object} configItem 
 */
export const renderTimePickerHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return antdFieldDecorator(
        configItem,
        (
            <TimePicker 
                {...props}
            >
            </TimePicker>
        )
    )
}

/**
 * 渲染 antd DatePicker  组件
 * 
 * @param {Object} configItem 
 */
export const renderDatePickerHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    // props 处理
    props.getCalendarContainer = ( triggerNode ) => {
        return triggerNode;
    };
    return antdFieldDecorator(
        configItem, 
        (
            <DatePicker
                {...props}
            >
            </DatePicker>
        )
    )
}


/**
 * 渲染 antd DatePicker.props.showTime = true  组件
 * 
 * @param {Object} configItem 
 */
export const renderDateTimePickerHandler = (configItem) => {
    const props = getConfigItemProps(configItem);
    // props 处理
    props.getCalendarContainer = ( triggerNode ) => {
        return triggerNode;
    };
    props.format = props.format || "YYYY-MM-DD HH:mm:ss";
    props.showTime = props.showTime || true;
    return antdFieldDecorator(
        configItem, 
        (
            <DatePicker
                {...props}
            >
            </DatePicker>
        )
    )
}

/**
 * 渲染 antd DatePicker.MonthPicker  组件
 * 
 * @param {Object} configItem 
 */
export const renderMonthPickerHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    // props 处理
    props.getCalendarContainer = ( triggerNode ) => {
        return triggerNode;
    };
    return antdFieldDecorator(
        configItem, 
        (
            <MonthPicker
                {...props}
            >
            </MonthPicker>
        )
    )
}

/**
 * 渲染 antd DatePicker.WeekPicker  组件
 * 
 * @param {Object} configItem 
 */
export const renderWeekPickerHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    // props 处理
    props.getCalendarContainer = ( triggerNode ) => {
        return triggerNode;
    };
    return antdFieldDecorator(
        configItem, 
        (
            <WeekPicker
                {...props}
            >
            </WeekPicker>
        )
    )
}

/**
 * 渲染 antd RangePicker 组件
 * 
 * @param {Object} configItem 
 */
export const renderDateRangePicker = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    // props 处理
    props.getCalendarContainer = ( triggerNode ) => {
        return triggerNode;
    };
    return antdFieldDecorator(
        configItem, 
        (
            <RangePicker
                {...props}
            >
            </RangePicker>
        )
    )
}

/**
 * 渲染 antd RangePicker.props.showTime = true 组件
 * 
 * @param {Object} configItem 
 */
export const renderDateTimeRangePicker = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    // props 处理
    props.getCalendarContainer = ( triggerNode ) => {
        return triggerNode;
    };
    props.format = props.format || "YYYY-MM-DD HH:mm:ss";
    props.showTime = props.showTime || true;
    return antdFieldDecorator(
        configItem, 
        (
            <RangePicker
                {...props}
            >
            </RangePicker>
        )
    )
}

/**
 * 渲染 antd RangePicker.props.showTime = true 组件
 * 
 * @param {Object} configItem 
 */
export const renderSelectHandler = (configItem = {}) => {
    const { data } = configItem;
    const props = getConfigItemProps(configItem);
    return antdFieldDecorator(
        configItem, 
        (
            <Select
                {...props}
            >
                {
                    Array.isArray(data) && data.map(item => {
                        return (
                            <Option
                                key={item.value}
                                value={item.value}
                                disabled={item.disabled}
                                className={item.className}
                            >
                                { item.label }
                            </Option>
                        )
                    })
                }
            </Select>
        )
    )
}


/**
 * 渲染 antd Switch 组件
 * 
 * @param {Object} configItem 
 */
export const renderSwitchHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return antdFieldDecorator(
        configItem, 
        (
            <Switch
                {...props}
            >
            </Switch>
        )
    )
}

/**
 * 渲染 antd Checkbox 组件
 * 
 * @param {Object} configItem 
 */
export const renderCheckboxHandler = (configItem = {}) => {
    const { data } = configItem;
    const props = getConfigItemProps(configItem);
    const buildDom = () => {
        if( data && data.length ){
            return (
                <CheckboxGroup
                    {...props}
                >
                    {
                        data && data.map(item => {
                            return (
                                <Checkbox
                                    key={item.value}
                                    value={item.value}
                                >
                                    {
                                        item.label
                                    }
                                </Checkbox>
                            )
                        })
                    }
                </CheckboxGroup>
            )
        }else{
            return (
                <Checkbox
                    key={configItem.key}
                >
                    {
                        configItem.label
                    }
                </Checkbox>
            )
        }
    }
    return antdFieldDecorator(
        configItem, 
        (
            buildDom()
        )
    )
}

/**
 * 渲染 antd Radio 组件
 * 
 * @param {Object} configItem 
 */
export const renderRadioHandler = (configItem = {}) => {
    const { data } = configItem;
    const props = getConfigItemProps(configItem);
    props.options = data || [];
    return antdFieldDecorator(
        configItem, 
        (
           
            <RadioGroup
                {...props}
            >
            </RadioGroup>
        )
    )
}

/**
 * 渲染 antd Upload 组件
 * 
 * @param {Object} configItem 
 */
export const renderUploadHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return antdFieldDecorator(
        configItem, 
        (
           
            <Upload
                {...props}
            >
            </Upload>
        )
    )
}

/**
 * 渲染 private submit 组件
 * 
 * @param {Object} configItem json配置单元
 */
export const renderSubmitButtonHandler = (configItem = {}) => {
    const label = configItem.label || 'Submit';
    const props = getConfigItemProps(configItem);
    props.onClick = () => {
        onSubmitHandler && onSubmitHandler(configItem);
    }
    return (
        <Button
            {...props}
        >
            { label }
        </Button>
    )
}

/**
 * @description 渲染 private text 组件s
 * 
 * @param {Object} configItem 
 */
export const renderTextHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    return (
        <span {...props}>{props.label}</span>
    )
}

/**
 * @description 渲染自定义组件部分
 * 
 * @param {Object} configItem 
 */
export const renderCustomizeHandler = (configItem = {}) => {
    const props = getConfigItemProps(configItem);
    const CustomizeComponent = configItem.render && configItem.render(props);
    return antdFieldDecorator(
        configItem, 
        CustomizeComponent
    )
}

/**
 * @description 最终结构渲染处理
 *              此处为了兼容 antd formItem 内只能有一个 getFieldDecorator 包裹的 dom
 * 
 * @param {Object}          configItem  json配置单元
 * @param {AntdReactDom}    dom         通过 antd getFieldDecorator 高阶函数注册好的 dom
 */
export const finalRenderHandler = (configItem = {}, dom) => {
    const flag = isNeedWrapFormItem(configItem);
    const key = getKey(configItem);
    const props = getConfigItemProps(configItem);
    props.key = key;
    if( flag ){
        return (
            <FormItem
                {...props}
            >
                {
                    dom
                }
            </FormItem>
        )
    }else{
        return dom
    }
}
