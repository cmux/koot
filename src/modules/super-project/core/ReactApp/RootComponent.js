import React, { Component } from 'react'
import { ImportStyleRoot } from 'sp-css-import'

@ImportStyleRoot()
export default class RootComponent extends Component {
    render() {
        return (
            <div>{this.props.children}</div>
        )
    }
}