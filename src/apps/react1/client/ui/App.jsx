import React from 'react'

export default class extends React.Component {
    render() {
        return (
            <div id="app">
                {this.props.children}
            </div>
        )
    }
}