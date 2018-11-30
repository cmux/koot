
/**
 * Form 提交事件 统一处理函数
 * 
 * @param {Object} configItem 
 */
export const onSubmitHandler = ( configItem ) => {
    const { __root, __rootProps } = configItem;
    const { onSubmit } = __rootProps;
    const formData = __root.fieldStore.getFieldValues();
    onSubmit && onSubmit(formData);
}

/**
 * Form 数据 onChange 事件，统一处理函数
 * 
 * @param {Object} configItem 
 */
export const onChangeHandler = ( configItem ) => {
    const { __root, __rootProps } = configItem;
    const { onChange } = __rootProps;
    const formData = __root.fieldStore.getFieldValues();
    onChange && onChange(formData);
}