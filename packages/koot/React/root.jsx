import React from 'react'
import { Provider } from 'react-redux'
import Router from 'react-router/lib/Router'

import { StyleMapContext } from './styles'

export default ({
    store,
    history,
    routes,
    ...props
}) => {

    // console.log({
    //     history, routes, ...props
    // })

    return (
        <StyleMapContext.Provider value={{}}>
            <Provider store={store} >
                <Router history={history} {...props} >
                    {routes}
                </Router>
            </Provider>
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
