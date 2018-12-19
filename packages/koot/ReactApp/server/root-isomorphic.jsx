/* global
    __KOOT_SSR__:false
*/

import React from 'react'
import { Provider } from 'react-redux'
import RouterContext from 'react-router/lib/RouterContext'

import { idDivStylesContainer, StyleMapContext } from '../../React/styles'

const Root = ({
    store, ...props
}) => {
    return (
        <StyleMapContext.Provider value={{}}>
            <Provider store={store} >
                <RouterContext {...props} />
            </Provider>
            <StylesContainer />
        </StyleMapContext.Provider>
    )
}

export default Root

/**
 * React 组件: 样式表内容容器
 */
export class StylesContainer extends React.Component {
    static contextType = StyleMapContext
    render() {
        return (
            <div
                id={idDivStylesContainer}
                dangerouslySetInnerHTML={{
                    __html: Object.keys(this.context)
                        .filter(id => !!this.context[id].css)
                        .map(id => `<style id="${id}">${this.context[id].css}</style>`)
                        .join('')
                }}
            />
        )
    }
}

// let e = Root

// if (__DEV__) {
//     const { hot, setConfig } = require('react-hot-loader')
//     setConfig({ logLevel: 'debug' })
//     e = hot(module)(Root)
// }

// export default e
