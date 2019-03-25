import React from 'react';
import { extend } from 'koot';
import classnames from 'classnames';
import Nav from '@components/nav';
import Logo from '@components/logo';

class Header extends React.Component {
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
