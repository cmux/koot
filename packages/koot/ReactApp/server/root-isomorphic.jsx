import React from 'react';
import { Provider } from 'react-redux';
import RouterContext from 'react-router/lib/RouterContext';

// import { idDivStylesContainer, StyleMapContext } from '../../React/styles'

const Root = ({ store, ...props }) => {
    // console.log('Root', {
    //     'in __KOOT_SSR__': __KOOT_SSR__.LocaleId
    // })
    // console.log('Root render Store', typeof Store === 'undefined' ? undefined : Store)
    return (
        // <StyleMapContext.Provider value={{}}>
        <Provider store={store}>
            <RouterContext {...props} />
        </Provider>
        // <StylesContainer />
        // </StyleMapContext.Provider>
    );
};

export default Root;

/**
 * React 组件: 样式表内容容器
 */
// const StylesContainer = () =>
//     <div
//         id={idDivStylesContainer}
//         dangerouslySetInnerHTML={{
//             __html: Object.keys(__KOOT_SSR__.styleMap)
//                 .filter(id => !!__KOOT_SSR__.styleMap[id].css)
//                 .map(id => `<style id="${id}">${__KOOT_SSR__.styleMap[id].css}</style>`)
//                 .join('')
//         }}
//     />

// let e = Root

// if (__DEV__) {
//     const { hot, setConfig } = require('react-hot-loader')
//     setConfig({ logLevel: 'debug' })
//     e = hot(module)(Root)
// }

// export default e
