// import React from 'react'

/**
 * 生成 StyleMapContext
 */
// export const createStyleMapContext = () => {
//     return React.createContext({})
// }

// export let StyleMapContext = createStyleMapContext()

/**
 * 将样式表写入到 head 标签内
 * @param {Object} styleMap
 */
export const checkAndWriteIntoHead = (styleMap = {}) => {
    if (typeof styleMap !== 'object') return;
    Object.keys(styleMap).forEach(wrapper => {
        const style = styleMap[wrapper];
        const el = document.querySelector(
            `style[${__STYLE_TAG_MODULE_ATTR_NAME__}=${wrapper}]`
        );
        if (style.count > 0) {
            // 配置样式
            if (!el && style.css !== '') {
                const styleTag = document.createElement('style');
                styleTag.innerHTML = style.css;
                // styleTag.setAttribute('id', wrapper);
                styleTag.setAttribute(__STYLE_TAG_MODULE_ATTR_NAME__, wrapper);
                document.getElementsByTagName('head')[0].appendChild(styleTag);
            }
        } else {
            // 移除样式
            if (el) {
                el.remove();
            }
        }
    });
};

// const getStyleMap = (passedMap) => {
//     if (__CLIENT__)
//         return passedMap
//     if (typeof __KOOT_SSR__ === 'object') {
//         // console.log({ LocaleId })
//         return __KOOT_SSR__.styleMap.get(LocaleId)
//     }
//     return passedMap
// }

/**
 * 追加样式
 * @param {Object} styleMap
 * @param {Object|Array} style
 */
export const append = (styleMap = {}, style) => {
    // const styleMap = getStyleMap(passedMap)

    if (Array.isArray(style))
        return style.forEach(theStyle => append(styleMap, theStyle));

    if (typeof style !== 'object') return;

    if (!styleMap[style.wrapper]) {
        styleMap[style.wrapper] = {
            css: style.css,
            count: 1
        };
    } else {
        styleMap[style.wrapper].count++;
    }

    if (__CLIENT__) {
        checkAndWriteIntoHead(styleMap);
    }
};

/**
 * 移除样式
 * @param {Object} styleMap
 * @param {*} style
 */
export const remove = (styleMap = {}, style) => {
    // const styleMap = getStyleMap(passedMap)

    if (Array.isArray(style))
        return style.forEach(theStyle => remove(theStyle));

    if (typeof style !== 'object') return;

    if (styleMap[style.wrapper]) {
        styleMap[style.wrapper].count--;
    }
};

// export const idDivStylesContainer = '__KOOT_ISOMORPHIC_STYLES_CONTAINER__'

// /**
//  * 分析 HTML 代码，解析已有样式表，将其从 HTML 代码中移除，并返回可以直接写入到 head 标签内的样式表代码
//  * @param {String} html
//  * @returns {String} htmlStyles
//  */
// export const parseHtmlForStyles = (html) => {
//     const matches = html.match(new RegExp(`<div id="${idDivStylesContainer}">(.*?)</div>`, 'm'))
//     if (
//         !matches ||
//         typeof matches !== 'object' ||
//         typeof matches.index === 'undefined' ||
//         typeof matches[1] === 'undefined'
//     )
//         return {
//             html,
//             htmlStyles: ''
//         }
//     return {
//         html: html.substr(0, matches.index),
//         htmlStyles: matches[1]
//     }
// }

// /**
//  * React 组件: 样式表内容容器
//  */
// export class StylesContainer extends React.Component {
//     static contextType = StyleMapContext
//     render() {
//         return (
//             <div
//                 id={idDivStylesContainer}
//                 dangerouslySetInnerHTML={{
//                     __html: Object.keys(this.context)
//                         .filter(id => !!this.context[id].css)
//                         .map(id => `<style id="${id}">${this.context[id].css}</style>`)
//                         .join('')
//                 }}
//             />
//         )
//     }
// }
