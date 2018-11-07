
/**
 * Form 提交事件 统一处理函数
 * 
 * @param {Object} configItem 
 */
export const onSubmitHandler = ( configItem ) => {
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
    const { __rootProps } = configItem;
    const { onChange } = __rootProps;
    const formData = __rootProps.form.getFieldsValue();
    onChange && onChange(formData);
}