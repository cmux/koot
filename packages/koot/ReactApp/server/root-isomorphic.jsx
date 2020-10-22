import { Provider } from 'react-redux';
import { RouterContext } from 'react-router';

import RootContext, {
    createValue as createContextValue,
} from '../../React/root-context';
// import { idDivStylesContainer, StyleMapContext } from '../../React/styles'

const Root = ({ store, ctx, ...props }) => {
    // console.log('Root', {
    //     'in __KOOT_SSR__': __KOOT_SSR__.LocaleId
    // })
    // console.log('Root render Store', typeof Store === 'undefined' ? undefined : Store)

    return (
        // <StyleMapContext.Provider value={{}}>
        <RootContext.Provider
            value={createContextValue({
                store,
                history: props.history,
                localeId: props.localeId,
                locales: props.locales,
                styles: props.styles,
                ctx,
            })}
        >
            <Provider store={store}>
                <RouterContext {...props} />
            </Provider>
        </RootContext.Provider>
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
