import React from 'react'
import { Provider } from 'react-redux'
import { Router } from 'react-router'

const Root = ({
    store,
    history,
    routes,
    ...props
}) =>
    <Provider store={store} >
        <Router history={history} {...props} >
            {routes}
        </Router>
    </Provider>

let e = Root

if (__DEV__) {
    const { hot, setConfig } = require('react-hot-loader')
    setConfig({ logLevel: 'debug' })
    e = hot(module)(Root)
}

export default e
