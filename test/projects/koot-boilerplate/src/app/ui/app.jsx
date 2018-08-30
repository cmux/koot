import React from 'react'
import { connect } from 'react-redux'
// import classNames from 'classnames'
import { ImportStyle } from 'sp-css-import'

import { store, history } from 'koot'

import Nav from '@ui/layout/nav'
import Main from '@ui/layout/main'

let stateShowed = false
@connect(state => {
    if (__CLIENT__ && !stateShowed) {
        console.log('root: redux store conected', state)
        stateShowed = true
    }
    return {}
})
@ImportStyle(require('./app.less'))
export default class App extends React.Component {
    static onServerRenderStoreExtend(/*o*/) {
        // if (__DEV__) console.log('static async onServerRenderStoreExtend', o)
        return ''
    }

    componentDidMount() {
        if (__DEV__) {
            console.log('redux store', store)
            console.log('redux history', history)
        }
    }
    render = () => (
        <React.StrictMode>
            <ErrorBoundary>
                <div id="app" className={this.props.className}>
                    <Nav />
                    <Main children={this.props.children} />
                </div>
            </ErrorBoundary>
        </React.StrictMode>
    )
}

class ErrorBoundary extends React.Component {
    componentDidCatch(error, info) {
        console.log('ERROR', error, info)
        // Display fallback UI
        // this.setState({ hasError: true })
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }

    render = () => this.props.children
}
