import React, { Component } from 'react'
import { ImportStyleRoot } from 'sp-css-import'

@ImportStyleRoot()
class RootComponent extends Component {
    render() {
        return (
            <div>{this.props.children}</div>
        )
    }
}

export default RootComponent
