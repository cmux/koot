import React, { Component } from 'react';
import { extend } from 'koot';
import { Affix } from 'antd';
import Nav from '@modules/nav';
import Logo from '@modules/logo';
import classnames from 'classnames';

class Header extends Component {
    render() {
        return (
            // Affix 作用是固定header,如不需要可以去掉
            <div className={classnames('header', this.props.className)}>
                <Affix offsetTop={0}>
                    <header>
                        <div className="flex-center main ">
                            <Logo />
                            <Nav />
                        </div>
                    </header>
                </Affix>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Header);
