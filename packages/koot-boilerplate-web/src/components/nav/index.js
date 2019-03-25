// 移动端导航
import React from 'react';
import { extend } from 'koot';
import { slide as Menu } from 'react-burger-menu';
// import classnames from 'classnames';
import { Link } from 'react-router';

const config = [
    {
        name: '首页',
        link: '/home',
    },
    {
        name: '新闻页',
        link: '/news',
    },
    {
        name: '关于',
        link: '/about',
    },
];
class MobileNav extends React.Component {
    render() {
        return (
            <nav className={this.props.className}>
                {/* pc导航 */}
                <div className="pc-nav">
                    <ul className="flex-center">
                        {config.map((item, index) => {
                            return (
                                <li key={index} className="nav-item">
                                    <Link to={item.link} rel="noopener noreferrer">
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
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
