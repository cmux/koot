import React from 'react'
import { extend } from 'koot'
import classNames from 'classnames'

import navItems from '@constants/nav-items'

import Center from '@components/center'
import Icon from '@components/icon'
import NavItem from '@components/nav/item'

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
                        {[['/', 'home']].concat(navItems).map((item, index) => (
                            <NavItem key={index} to={item} />
                        ))}
                        {/* <a href="https://koot.js.org" target="_blank" className="out-link docs">
                            {__("navs.docs")}
                            <Icon className="icon" icon="new-tab" />
                        </a> */}
                    </div>
                    <div className="others">
                        {/* <a href="https://koot.js.org" target="_blank" className="other-link docs">
                            <Icon className="icon" icon="books" />
                            {__("navs.docs")}
                        </a> */}
                        <a href="https://github.com/cmux/koot" target="_blank" className="other-link github">
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
