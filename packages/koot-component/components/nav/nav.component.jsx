import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router';
import animation from './openAnimation.js';
import classNames from 'classnames';

const { SubMenu, Item } = Menu;

const cache = {
    abbreviationList: []
};

const hasChinese = ( string ) => {
    const patrn=/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    return patrn.exec(string);
}
/**
 * 获取简称
 * 
 * @param {*} routeItem 
 */
const getMenuItemAbbreviation = ( name ) => {
    const { abbreviationList } = cache;
    if( name && Object.prototype.toString.call(name) === '[object String]' ){
        let i = 1;
        let result = name.substring(0, i);
        if( hasChinese(name) ){
            return result;
        }
        while (i < name.length && abbreviationList.indexOf(result) !== -1) {
            i = i + 1;
            const firstCharacter = name.substring(0, 1);
            const secondCharacter = name.substring(i-1, i);
            result = firstCharacter + secondCharacter;
        }
        if( result && abbreviationList.indexOf(result) === -1 ){
            abbreviationList.push(result);
        }
        return result;
    }
    return '';
}

const isNeedShow = ( childrenList ) => {
    childrenList.forEach(item => {
        if( item.meta && item.meta.showMenu !== false ){
            return true;
        }
    })
    return false;
}

const renderMenuItemContent = ( routeItem ) => {
    let abbreviation;
    if( routeItem.meta && !routeItem.meta.icon ){
        abbreviation = getMenuItemAbbreviation(routeItem.meta.name);
    }
    return (
        <div className="nav-menuitem-content">
            <span className="nav-title">
                { routeItem.meta && routeItem.meta.name }
            </span>
            <span className="nav-detail">
                { routeItem.meta && routeItem.meta.detail }
            </span>
            {
                routeItem.children && isNeedShow(routeItem.children)
                ?   <span className="nav-icon-arrow">
                        <Icon type="left" theme="outlined" />
                    </span>
                :   ''
            }
            <span className="nav-icon-thumbnail">
                {
                    routeItem.meta && routeItem.meta.icon
                    ?   <Icon type={routeItem.meta.icon} theme="outlined" />
                    :   abbreviation
                }
            </span>
        </div>
    )
}

const renderMenuList = ( _baseUrl, _routeList ) => {
    cache.abbreviationList = [];
    return (
        _routeList.map((routeItem, routeIndex) => {
            const currentUrl = `${_baseUrl}${routeItem.path}`;
            const key = `${currentUrl}-${routeIndex}`;
            if( routeItem.meta ){
                const { showMenu } = routeItem.meta;
                if( showMenu === false ){
                    return '';
                }
            }
            if( 
                routeItem.children && 
                routeItem.children.length > 0 &&
                isNeedShow( routeItem.children )
            ){
                return (
                    <SubMenu 
                        key={key}
                        title={
                            renderMenuItemContent(routeItem)
                        }
                        openTransitionName=""
                        openAnimation=""
                    >
                        { renderMenuList(`${currentUrl}/`, routeItem.children) }
                    </SubMenu>
                )
            }else{
                return (
                    <Item
                        key={key}
                    >
                        <Link to={currentUrl}>
                            { renderMenuItemContent(routeItem) }
                        </Link>
                    </Item>
                )
            }
        })
    )
}

@KootExtend({
    styles: require('./nav.module.less'),
})

class Nav extends Component {

    static propTypes = {
        children: PropTypes.node,
        routeList: PropTypes.array,
        baseUrl: PropTypes.string
    }

    state = {
        openKeys: [],
    }

    render() {
        const { className, routeList, baseUrl } = this.props;
        const { openKeys } = this.state;
        const { openChangeHandler } = this;
        const menuNodeList = routeList && routeList.length > 0 && renderMenuList(baseUrl, routeList);
        const classes = classNames([
            className,
            'nav-component-wrapper'
        ]);
        return (
            <Menu
                theme="transparent"
                mode="inline"
                className={classes}
                openAnimation={animation}
                openKeys={openKeys}
                onOpenChange={openChangeHandler}
            >
                {
                    menuNodeList
                }
            </Menu>
        );
    }

    openChangeHandler = ( openKeys ) => {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        this.setState({
            openKeys: latestOpenKey ? [latestOpenKey] : []
        })
    }
}

export default Nav;
