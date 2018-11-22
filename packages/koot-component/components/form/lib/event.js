
/**
 * Form 提交事件 统一处理函数
 * 
 * @param {Object} configItem 
 */
export const onSubmitHandler = ( configItem ) => {
    console.info('event.js - onSubmitHandler')
    const { __rootProps } = configItem;
    const { onSubmit } = __rootProps;
    const formData = __rootProps.form.getFieldsValue();
    onSubmit && onSubmit(formData);
}

/**
 * Form 数据 onChange 事件，统一处理函数
 * 
 * @param {Object} configItem 
 */
export const onChangeHandler = ( configItem ) => {
    console.info('event.js - onChangeHandler')
    const { __rootProps } = configItem;
    const { onChange } = __rootProps;
    const formData = __rootProps.form.getFieldsValue();
    onChange && onChange(formData);
}