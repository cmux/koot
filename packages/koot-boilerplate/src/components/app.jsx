import React from 'react'
import { extend } from 'koot'

import { Link, IndexLink } from 'react-router'

const App = extend({
    styles: require('./app.component.less')
})(
    ({ className, children, ...props }) => (
        <div className={className}>
            <Nav className="nav" {...props} />
            <Main className="main" children={children} {...props} />
        </div>
    )
)

const Nav = ({ routeParams, location, params, route, router, routes, ...props }) => (
    <nav {...props}>
        <IndexLink activeClassName="on" to="/" children="Home" />
        <Link activeClassName="on" to="/static" children="Static" />
    </nav>
)

const Main = ({ routeParams, location, params, route, router, routes, ...props }) => (
    <main {...props} />
)

export default App
