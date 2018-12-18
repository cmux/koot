import React from 'react'
import { store, history, extend } from 'koot'

import Nav from './_layout/nav'
import Main from './_layout/main'

let stateShowed = false

console.log('App Store', typeof Store === 'undefined' ? undefined : Store)

@extend({
    connect: state => {
        if (__CLIENT__ && __DEV__ && !stateShowed) {
            console.log('root: redux store conected', state)
            stateShowed = true
        }
        return {}
    },
    styles: require('./app.less')
})
class App extends React.Component {
    componentDidMount() {
        if (__DEV__) {
            console.log('redux store', store)
            console.log('history', history)
        }
    }
    componentDidCatch(error, info) {
        console.log('ERROR', error, info)
        // Display fallback UI
        // this.setState({ hasError: true })
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }
    componentDidUpdate() {
        // console.log(this.props)
    }
    render = () => (
        <React.StrictMode>
            <div id="app" className={this.props.className}>
                <Nav />
                <Main children={this.props.children} />
            </div>
        </React.StrictMode>
    )
}

export default App
