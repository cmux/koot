import { renderFormHandler } from '../render.jsx';

const colWrapper = (config, list) => {
    const { colNumber = 4 } = config;
    if( !list || list.length === 0 ){
        return [];
    }
    return list.map(item => {
        const { span, xl, lg, md, sm, xs } = item;
        delete item.span;
        return {
            type: 'col',
            span: span || 24/colNumber,
            xl: xl || 24/colNumber,
            lg: lg || 12,
            md: md || 12,
            sm: sm || 24,
            xs: xs || 24,
            children: [
                item
            ]
        }
    })
}

const rowWrapper = (config, list, gutter) => {
    return [{
        type: 'row',
        gutter: gutter || 24,
        children: [
            ...list
        ]
    }]
}

const formItemWrapper = (config, list ) => {
    return list.map(listItem => {
        if( Array.isArray(listItem) ){
            const firstItem = listItem[0];
            const { formLabel, gutter } = firstItem || {};
            formLabel && delete firstItem.formLabel
            let nextList = colWrapper(listItem);
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
            const { formLabel } = listItem;
            delete listItem.formLabel;
            return {
                type: 'formItem',
                label: formLabel ||'',
                children: [
                    listItem
                ]
            }
        }
    })
}

const filterLayoutWrapper = (config, list) => {
    const nextFormItemList = formItemWrapper(config, list);
    const nextColList = colWrapper(config, nextFormItemList);
    const nextRowList = rowWrapper(config, nextColList);
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
const renderFilterFormHandler = ( config = {} ) => {
    const waitHandlList = config.children;
    const resultConfig = filterLayoutWrapper(config, waitHandlList);

    delete resultConfig.colNumber

    return renderFormHandler(resultConfig);
}

export default renderFilterFormHandler;
