import React, { Component } from 'react';
import { extend } from 'koot';
import classnames from 'classnames';
import Nav from '@modules/nav';
import Logo from '@modules/logo';

class Header extends Component {
    render() {
        return (
            <header className={classnames(this.props.className, 'header')}>
                <div className="flex-center main ">
                    <Logo />
                    <Nav />
                </div>
            </header>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Header);
