import React from 'react';
import { extend } from 'koot';

import navItems from '@constants/nav-items';
import { github as urlGithub } from '@constants/urls';

import { Link } from 'react-router';
import NavItem from '@components/nav/item';

import styles from './index.module.less';

// ============================================================================

// ! i18n is disabled in SPA mode
const intros = __SPA__ ? [] : __('intro');

// ============================================================================

const PageHome = extend({
    pageinfo: () => ({
        title: `${__('pages.home.title')} - ${__('title')}`,
        metas: [{ description: __('pages.home.description') }]
    }),
    styles
})(({ className }) => (
    <div className={className}>
        <div className="wrapper">
            <h2 className="title">Koot.js</h2>
            <span className="intro">
                {intros.map((str, index) => (
                    <span className="line" key={index}>
                        {str}
                    </span>
                ))}
            </span>
            <Link className="button-start" to="/start">
                {__('pages.home.start')}
            </Link>
        </div>
        <div className="nav">
            {navItems.concat([[urlGithub, 'github']]).map((item, index) => (
                <NavItem key={index} to={item} />
            ))}
        </div>
    </div>
));

export default PageHome;
