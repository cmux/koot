import React from 'react'
import { extend } from 'koot'

import Link from '@components/link'

const Nav = props => (
    <div {...props}>
        <h1 className="logo">Koot.js</h1>
        {[
            {
                title: __('pages.home.title'),
                to: '/'
            },
            {
                title: __('pages.extend.title'),
                to: '/extend'
            },
            {
                title: __('pages.static.title'),
                to: '/static'
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

export default extend({
    styles: require('./styles.less')
})(Nav)
