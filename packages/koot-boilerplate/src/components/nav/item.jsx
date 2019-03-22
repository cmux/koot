import React from 'react'
import classNames from 'classnames'

import { Link, IndexLink } from 'react-router'
import Icon from '@components/icon'

const NavItem = ({ to, className, ...otherProps }) => {
    let route, name, Component

    if (Array.isArray(to)) {
        route = to[0]
        name = to[1]
    } else {
        route = to
        name = to
    }

    const props = {
        className: classNames(['item', className]),
        ...otherProps
    }

    if (/^([a-z]+):\/\//i.test(route)) {
        props.href = route
        props.target = "_blank"
        props.className += ' out-link'
        return (
            <a {...props}>
                {__('navs', name)}
                <Icon className="icon" icon="new-tab" />
            </a>
        )
    }

    props.activeClassName = 'on'
    props.to = route
    props.children = __('navs', name)

    Component = (() => {
        if (route === '/')
            return IndexLink
        return Link
    })()

    return (
        <Component {...props} />
    )
}

export default NavItem
