import React from 'react'
import { extend } from 'koot'
import classNames from 'classnames'

import navItems from '@constants/nav-items'

import { Link, IndexLink } from 'react-router'
import Center from '@components/center'
import Icon from '@components/icon'

@extend({
    connect: state => ({
        homeCoverHeight: state.pageHome.coverHeight
    }),
    styles: require('./styles.component.less')
})
class Nav extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show: !this.isHome(props)
        }
    }

    isHome(props = this.props) {
        return Boolean(props.location.pathname === '' || props.location.pathname === '/')
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.pathname !== this.props.location.pathname) {
            const show = !this.isHome()
            if (show !== this.state.show) {
                this.setState({
                    show
                })
            }
        }
        this.handleEvents()
    }

    componentDidMount() {
        this.windowScrollHandler()
        this.handleEvents()
    }

    handleEvents() {
        if (this.isHome) {
            window.addEventListener('scroll', this.windowScrollHandler)
        } else {
            window.removeEventListener('scroll', this.windowScrollHandler)
        }
    }

    windowScrollHandler = () => {
        if (this.isHome()) {
            // console.log(this.props.homeCoverHeight, window.pageYOffset || document.documentElement.scrollTop)
            const show = (window.pageYOffset || document.documentElement.scrollTop) > this.props.homeCoverHeight
            if (show !== this.state.show) {
                this.setState({
                    show
                })
            }
        } else if (!this.state.show) {
            this.setState({
                show: true
            })
        }
    }

    render() {
        const {
            // routeParams, location, params, route, router, routes,
            // dispatch,
            className,
            // ...props
        } = this.props

        return (
            <nav className={classNames([className, {
                'on': this.state.show
            }])}>
                <h1 className="title-hidden">Koot.js</h1>
                <Center className="wrapper">
                    <div className="nav-links">
                        {[['/', 'home']].concat(navItems).map((item, index) => {
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
                    </div>
                    <div className="others">
                        <a href="https://github.com/cmux/koot" target="_blank" className="github">
                            <Icon className="icon" icon="github" />
                            Fork on GitHub
                        </a>
                    </div>
                </Center>
            </nav>
        )
    }
}

export default Nav
