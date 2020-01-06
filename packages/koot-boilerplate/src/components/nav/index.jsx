import React from 'react';
import { extend } from 'koot';

import navItems from '@constants/nav-items';
import { github as urlGithub } from '@constants/urls';

import NavItem from '@components/nav/item';
import Center from '@components/center';
import Icon from '@components/icon';

import styles from './index.module.less';

// ============================================================================

const Nav = extend({
    styles
})(({ location, className }) => {
    if (location.pathname === '' || location.pathname === '/') return null;

    return (
        <nav className={className}>
            <h1 className="title-hidden">Koot.js</h1>
            <Center className="wrapper">
                <div className="nav-links">
                    {[['/', 'home']].concat(navItems).map((item, index) => (
                        <NavItem key={index} to={item} />
                    ))}
                </div>
                <div className="others">
                    <a
                        href={urlGithub}
                        target="_blank"
                        className="other-link github"
                        rel="noopener noreferrer"
                    >
                        <Icon className="icon" icon="github" />
                        Fork on GitHub
                    </a>
                </div>
            </Center>
        </nav>
    );
});

export default Nav;
