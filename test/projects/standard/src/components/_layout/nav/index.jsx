import React from 'react'
import { extend } from 'koot'

import Link from '@components/link'

const Nav = props => {
    const items = [
        {
            title: __SPA__ ? '首页' : __('pages.home.title'),
            to: '/'
        },
        {
            title: __SPA__ ? '静态资源' : __('pages.static.title'),
            to: '/static'
        }
    ]
    if (!__SPA__)
        items.splice(1, 0, {
            title: __('pages.extend.title'),
            to: '/extend'
        })
    return (
        <div {...props}>
            <h1 className="logo">Koot.js</h1>
            {items.map((o, index) => (
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

export default extend({
    styles: require('./styles.less')
})(Nav)
