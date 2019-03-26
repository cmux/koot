// 移动端导航
import React, { Component, Fragment } from 'react';
import { extend } from 'koot';
import { slide as Menu } from 'react-burger-menu';
import classnames from 'classnames';
import { Link } from 'react-router';

const config = [
    {
        name: '首页',
        link: '/home',
    },
    {
        name: '新闻页',
        link: '/news',
        more: [
            {
                name: '关于-1',
                link: '/about-1',
            },
            {
                name: '关于-2',
                link: '/about-2',
            },
        ],
    },
    {
        name: '关于',
        link: '/about',
    },
];
class MobileNav extends Component {
    renderList = (data, isMore) => {
        const navLink = (item, flag) => {
            return (
                <Link
                    to={item.link}
                    rel="noopener noreferrer"
                    className={classnames({ 'select-nav-btn': !!flag })}
                >
                    {item.name}
                </Link>
            );
        };
        return data.map((item, index) => {
            return (
                <li
                    key={index}
                    className={classnames(
                        !isMore ? 'nav-item' : '"select-nav-item"',
                        item.more ? 'hasSelect' : ''
                    )}
                >
                    {!item.more ? (
                        navLink(item)
                    ) : (
                        <Fragment>
                            {navLink(item, 1)}
                            <ul className="select-nav-wrap">
                                {this.renderList(item.more, 'more')}
                            </ul>
                        </Fragment>
                    )}
                </li>
            );
        });
    };
    render() {
        const { renderList } = this;
        return (
            <nav className={this.props.className}>
                {/* pc导航 */}
                <div className="pc-nav">
                    <ul className="flex-center">{renderList(config)}</ul>
                </div>
                {/* mobile导航 */}
                <div className="mobile-nav">
                    <Menu right>
                        {config.map((item, index) => {
                            return (
                                <Link
                                    to={item.link}
                                    className="nav-item"
                                    key={index}
                                    rel="noopener noreferrer"
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </Menu>
                </div>
            </nav>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(MobileNav);
