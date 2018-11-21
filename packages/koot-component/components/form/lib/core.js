import * as Renders from './render.jsx';

import * as Types from './constants.js';

/**
 * 断言name为必选项
 * 
 * @param {String} name 
 */
const assertName = (name) => {
    if( !name ){
        throw new Error(
            `FormComponentError: Required for the name attribute !`
        )
    }
}

/**
 * 按类型渲染处理函数
 * 
 * @param {Object} configItem json配置单元 
 */
export const renderTransfer = (configItem = {}) => {
    const { type } = configItem;
    // const layoutTypes = ['form', 'formItem', 'row', 'col'];
    switch( type ){

        // form 布局组件部分
        case Types.FORM:
            return Renders.renderFormHandler(configItem);
        case Types.FORM_ITEM:
            return Renders.renderFormItemHandler(configItem);
        case Types.ROW:
            return Renders.renderRowHandler(configItem);
        case Types.COL:
            return Renders.renderColHandler(configItem);
            
        // react 组件部分
        case Types.INPUT:
            return Renders.renderInputHandler(configItem);
        case Types.TEXT_AREA:
            return Renders.renderTextAreaHandler(configItem);
        case Types.INPUT_GROUP:
            return Renders.renderInputGroupHandler(configItem);
        case Types.PASSWORD:
            return Renders.renderPasswordHandler(configItem);
        // 日期组件部分
        case Types.DATE_PICKER:
            return Renders.renderDatePickerHandler(configItem);
        case Types.DATE_TIME_PICKER:
            return Renders.renderDateTimePickerHandler(configItem);
        case Types.WEEK_PICKER:
            return Renders.renderWeekPickerHandler(configItem);
        case Types.MOUNTH_PICKER:
            return Renders.renderMonthPickerHandler(configItem);
        case Types.TIME_PICKER:
            return Renders.renderTimePickerHandler(configItem);
        case Types.DATE_RANGE_PICKER:
            return Renders.renderDateRangePicker(configItem);
        case Types.DATE_TIME_RANGE_PICKER:
            return Renders.renderDateTimeRangePicker(configItem);
            
        case Types.SELECT:
            return Renders.renderSelectHandler(configItem);
        case Types.SWITCH:
            return Renders.renderSwitchHandler(configItem);
        case Types.CHECK_BOX:
            return Renders.renderCheckboxHandler(configItem);
        case Types.RADIO:
            return Renders.renderRadioHandler(configItem);
        case Types.UPLOAD:
            return Renders.renderUploadHandler(configItem);
        case Types.BUTTON:
            return Renders.renderButtonHandler(configItem);
        case Types.SUBMIT:
            return Renders.renderSubmitButtonHandler(configItem);
        
        // 自定义扩展组件部分
        case Types.TEXT:
            return Renders.renderTextHandler(configItem);
        case Types.CUSTOMIZE:
            return Renders.renderCustomizeHandler(configItem);
        default:
            return '';
    }
}

/**
 * 循环遍历渲染子元素
 * 增加每级 parent 引用指向
 * 
 * @param {Object} configItem json配置单元
 */
export const renderChildrenHandler = (configItem = {}) => {
    const { children } = configItem;
    return children && Array.isArray(children) && children.map((childrenItem, index) => {
        const key = getKey(childrenItem, index);
        childrenItem.key = key;
        childrenItem.__parent = configItem;
        childrenItem.__rootProps = configItem.__rootProps;
        // childrenItem.__refs = configItem.__refs;
        return renderTransfer(childrenItem);
    })
}

/**
 * 找寻第一个 formItem 父元素
 * 解决 antd formItem 下只能有直接包含一个 getFieldDecorator 的问题
 * 
 * @return  {Object | undefined}    第一匹配到的 formItem 父元素或者 undefined
 */
const getParentRenderFormItem = (configItem) => {
    if( configItem && configItem.__parent ){
        if( configItem.__parent.type === 'formItem' ){
            return configItem.__parent;
        }else{
            return getParentRenderFormItem(configItem.__parent);
        }
    }
    return undefined;
}

/**
 * 获取子级中所有表单控制元素
 * 
 * @return  {Array} 配置对象 List 
 */
const getChildrenControlElement = (configItem) => {
    let result = [];
    configItem && configItem.children && configItem.children.forEach(childrenItem => {
        if( childrenItem.type === Types.FORM_ITEM ){
            return;
        }
        if( Types.LAYOUT_TYPES.indexOf( childrenItem.type ) === -1 ){
            result.push(childrenItem);
        }
        if( childrenItem.children && childrenItem.children.length ){
            result = result.concat(
                getChildrenControlElement(childrenItem)
            )
        }
    })
    return result;
}

/**
 * 是否为最终渲染的表单控制元素
 * @return {Boolean}
 */
export const isNeedWrapFormItem = (configItem) => {
    const parentFormItem = getParentRenderFormItem(configItem);
    // 如果不存在 formItem 父级元素，默认添加一个
    if( !parentFormItem ){
        return true;
    }
    const childrenControlElement = getChildrenControlElement(parentFormItem);
    if( childrenControlElement && childrenControlElement.length > 1 ){
        return true;
    }else{
        return false;
    }
}

/**
 * 根据渲染对象生成唯一的key
 * 
 * @param {Object} configItem 
 * @param {Number} index 
 */
export const getKey = (configItem, index = 1) => {
    const { name, type } = configItem;
    const key = `${name || type }-${index}`;
    return key;
}

/**
 * 获取 configItem 的 name 并验证为必须项
 * 
 * @param {Object} configItem 
 */
export const getName = (configItem) => {
    const { name } = configItem;
    assertName(name);
    return name;
}
