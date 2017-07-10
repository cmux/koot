import React from 'react'
import { connect } from 'react-redux'

@connect()
export default class extends React.Component {

    static onServerRenderHtmlExtend(tool) {
        tool.setTitle('Yes')
    }

    render() {
        return (
            <div id="page1">
                this is page1.
            </div>
        )
    }
}
