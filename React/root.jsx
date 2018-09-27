import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { Router } from 'react-router'

import {
    append as appendStyle,
    remove as removeStyle,
    get as getStyle,
} from './styles'

class Root extends React.Component {
    static childContextTypes = {
        appendStyle: PropTypes.func,
        removeStyle: PropTypes.func,
        getStyle: PropTypes.func
    }

    getChildContext = () => ({
        appendStyle,
        removeStyle,
        getStyle
    })

    render() {
        const {
            store,
            history,
            routes,
            ...props
        } = this.props
        const styles = __SERVER__ ? getStyle() : {}
        return (
            <Provider store={store} >
                <Router history={history} {...props} >
                    {routes}
                    {__SERVER__ &&
                        <div id="styleCollection" dangerouslySetInnerHTML={{
                            __html: Object.keys(styles).map(wrapper => (
                                `<style id=${wrapper}>${styles[wrapper].css}</style>`
                            ))
                        }}></div>
                    }
                </Router>
            </Provider>
        )
    }
}

let e = Root

if (__DEV__) {
    const { hot, setConfig } = require('react-hot-loader')
    setConfig({ logLevel: 'debug' })
    e = hot(module)(Root)
}

export default e
