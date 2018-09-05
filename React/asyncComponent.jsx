// https://gist.github.com/acdlite/a68433004f9d6b4cbc83b5cc3990c194

const React = require('react')

module.exports = (getComponent) =>
    class AsyncComponent extends React.Component {
        static Component = null;
        state = { Component: AsyncComponent.Component };

        componentWillMount() {
            if (!this.state.Component) {
                getComponent().then(Component => {
                    AsyncComponent.Component = Component
                    this.setState({ Component })
                })
            }
        }
        render() {
            const { Component } = this.state
            if (Component) {
                return <Component {...this.props} />
            }
            return null
        }
    }
