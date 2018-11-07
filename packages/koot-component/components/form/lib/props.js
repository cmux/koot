import * as Types from './constants';

/**
 * FormItem 默认 Props
 * 
 * @param {Object} props 
 */
const formItemPropsHandler = (props) => {
    // formLabel 默认布局
    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 6 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 10 },
        },
    };
    const defaultProps = Object.assign({}, formItemLayout, {
        colon: false,
        label: ' '
    })
    return Object.assign({}, defaultProps, props);
}

/**
 * Select 默认 Props
 * 
 * @param {Object} props 
 */
const selectPropsHandler = (props) => {
    // props 处理
    props.getPopupContainer = ( triggerNode ) => {
        return triggerNode;
    };
    props.allowClear = true;
    if( props.multiple === true ){
        props.mode = 'multiple';
        delete props.multiple;
    }
    return props;
}

/**
 * Password 默认 Props
 * 
 * @param {Object} props 
 */
const passwordPropsHandler = (props) => {
    props.type = 'password';
    return props;
}

/**
 * Button Props 处理函数
 * 
 * @param {Object} props 
 */
const buttonPropsHandler = (props) => {
    const { buttonType } = props
    if( buttonType ){
        props.type = buttonType;
        delete props.buttonType;
    }
    return props;
}

/**
 * @description 根据配置对象生成 props
 * 
 * @param {Object} configItem 
 */
export const getConfigItemProps = (configItem = {}) => {
    const { __rootProps, type } = configItem;

    let props = Object.assign({}, configItem);

    // 通用处理
    delete props.type
    delete props.name
    delete props.data
    delete props.children
    delete props.initialValue
    delete props.__parent
    delete props.__rootProps
    
    if( typeof configItem.disabled === 'function' ) {
        const formData = __rootProps.form.getFieldsValue();
        props.disabled = configItem.disabled(formData || {});
    }

    // 根据类型处理
    switch(type){
        case Types.FORM_ITEM: 
            props = formItemPropsHandler(props);
            break;
        case Types.SELECT:
            props = selectPropsHandler(props);
            break;
        case Types.PASSWORD:
            props = passwordPropsHandler(props);
            break;
        case Types.BUTTON:
            props = buttonPropsHandler(props);
            break;
        default:
            break;
    }
    
    return props;
}