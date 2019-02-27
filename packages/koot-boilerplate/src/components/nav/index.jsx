import React from 'react'
import { extend } from 'koot'

import { Link, IndexLink } from 'react-router'
import Center from '@components/center'

const navItems = [
    ['/', 'home'],
    'isomorphic',
    'static'
]

@extend({
    connect: state => ({

    }),
    styles: require('./styles.component.less')
})
class Nav extends React.Component {
    // state = {
    //     show: true
    // }
    constructor(props) {
        super(props)
        console.log('Nav constructor', {
            'props.location.pathname': props.location.pathname
        })
        this.state = {
            show: true
        }
    }
    render() {
        const { routeParams, location, params, route, router, routes, dispatch, ...props } = this.props
        return (
            <nav {...props}>
                <h1 className="title-hidden">Koot.js</h1>
                {navItems.map((item, index) => {
                    let route, name, Component

                    if (Array.isArray(item)) {
                        route = item[0]
                        name = item[1]
                    } else {
                        route = item
                        name = item
                    }

                    Component = route === '/' ? IndexLink : Link

                    return (
                        <Component
                            className="item"
                            activeClassName="on"
                            to={route}
                            children={__('navs', name)}
                            key={index}
                        />
                    )
                })}
            </nav>
        )
    }
}

export default Nav
