import { LAYOUT_TYPES } from '../constants.js';
import { renderFormHandler } from '../render.jsx';
/**
 * 固定布局的方案，减少每次都要输入很多 row/col 之类的布局
 * 
 * @param {Obejct} config 
 */
const renderSearchFilterFormHandler = ( config = {} ) => {
    let nextConfig = Object.assign({}, config);
    if( isAllControllElement(nextConfig) ){
        
        nextConfig = nextConfig.children.map(item => {
            const { formLabel } = item;
            delete item.formLabel;
            return  {
                type: 'col',
                span: 6,
                children: [
                    {
                        type: 'formItem',
                        label: formLabel,
                        children: [
                            item
                        ]
                    }
                ]
            }
        })

        nextConfig.children = {
            type: 'row',
            gutter: 24,
            children: [
                ...nextConfig.children
            ]
        }
    }
    
    return renderFormHandler(nextConfig);
}

const isAllControllElement = ( config = {} ) => {
    const childrenList = config.children;
    if( !childrenList ){
        return true;
    }
    const isNotControllElementList = childrenList.filter(item => {
        return LAYOUT_TYPES.indexOf(item.type) !== -1;
    })
    if( isNotControllElementList && isNotControllElementList.length ){
        return false;
    }else{
        return true;
    }
}

export default renderSearchFilterFormHandler;
