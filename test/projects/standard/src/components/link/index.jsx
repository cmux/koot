import React from 'react'
import { Link, IndexLink } from 'react-router'
// import routerReplace from '@appUtils/router-replace'

export default ({
    component, tag,
    to, href, link,
    // onClick,
    // replace = false,
    ...props
}) => {
    const _to = to || href || link
    const Component = component || tag || (_to === '/' ? IndexLink : Link)
    return (
        <Component
            to={_to}
            onClick={(/*evt*/) => {
                // evt.preventDefault()
                // // routerReplace(to)
                // if (typeof onClick === 'function')
                //     return onClick(evt)
            }}
            {...props}
        />
    )
}
