import React from 'react'
// import { connect } from 'react-redux'
import { ImportStyle } from 'sp-css-import'

import Link from '@ui/components/link'

// @connect()
@ImportStyle(require('./styles.less'))
export default class extends React.Component {
    render() {
        return (
            <div className={this.props.className}>
                <div className="logo" />
                {[
                    {
                        title: '首页 (测试)',
                        to: '/'
                    },
                    {
                        title: __('pages.data.nav'),
                        to: '/data'
                    },
                    {
                        title: 'DEV (测试)',
                        to: '/dev'
                    }
                ].map((o, index) => (
                    <Link
                        key={index}
                        className="nav-item"
                        to={o.to}
                        children={o.title}
                        activeClassName="on"
                    />
                ))}
            </div>
        )
    }
}
