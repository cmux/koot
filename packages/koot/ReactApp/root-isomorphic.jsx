import React from 'react'
import { Provider } from 'react-redux'
import RouterContext from 'react-router/lib/RouterContext'

import { StyleMapContext, StylesContainer } from '../React/styles'

export default ({
    store,
    ...props
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

// let e = Root

// if (__DEV__) {
//     const { hot, setConfig } = require('react-hot-loader')
//     setConfig({ logLevel: 'debug' })
//     e = hot(module)(Root)
// }

// export default e
