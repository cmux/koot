import { renderFormHandler } from '../render.jsx';

const colWrapper = (list) => {
    if( !list || list.length === 0 ){
        return [];
    }
    return list.map(item => {
        const { span } = item;
        delete item.span;
        return {
            type: 'col',
            span: span || 6,
            children: [
                item
            ]
        }
    })
}

const rowWrapper = (list, gutter) => {
    return [{
        type: 'row',
        gutter: gutter || 24,
        children: [
            ...list
        ]
    }]
}

const formItemWrapper = ( list ) => {
    return list.map(item => {
        if( Array.isArray(item) ){
            const firstItem = item[0];
            const { formLabel, gutter } = firstItem || {};
            formLabel && delete firstItem.formLabel
            let nextList = colWrapper(item);
            if( gutter ){
                nextList = rowWrapper(nextList, gutter);
            }
            return {
                type: 'formItem',
                label: formLabel ||'',
                children: [
                    ...nextList
                ]
            }
        }else{
            const { formLabel } = item;
            delete item.formLabel;
            return {
                type: 'formItem',
                label: formLabel ||'',
                children: [
                    item
                ]
            }
        }
    })
}

const searchFilterLayoutWrapper = (config, list) => {
    const nextFormItemList = formItemWrapper(list);
    const nextColList = colWrapper(nextFormItemList);
    const nextRowList = rowWrapper(nextColList);
    const nextForm = Object.assign({}, config, {
        children: nextRowList
    })
    return nextForm;
}

/**
 * 固定布局的方案，减少每次都要输入很多 row/col 之类的布局
 * 
 * @param {Obejct} config 
 */
const renderSearchFilterFormHandler = ( config = {} ) => {
    const waitHandlList = config.children;
    const resultConfig = searchFilterLayoutWrapper(config, waitHandlList);
    
    return renderFormHandler(resultConfig);
}

export default renderSearchFilterFormHandler;
