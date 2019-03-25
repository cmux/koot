import React from 'react';
import { extend } from 'koot';
import API from '@utils/api';
import http from '@utils/http';
import Header from '@components/header';
import classnames from 'classnames';

class PageHome extends React.Component {
    componentDidMount() {
        http.get(API.ACCOUNT.getList(), { params: { project_id: 61 } })
            .then(resp => {
                console.log('请求成功 ====> ', resp.data.categories);
            })
            .catch(err => {
                console.log(err);
            });
    }
    render() {
        return (
            <div className={classnames('home', this.props.className)}>
                <Header />
                <div className={this.props.className}>
                    <div className="cover" ref={el => (this._cover = el)}>
                        <h2>Koot.js</h2>
                        <div className="nav" />
                    </div>
                </div>
            </div>
        );
    }
}

export default extend({
    connect: true,
    pageinfo: () => ({
        title: `${__('pages.home.title')} - ${__('title')}`,
        metas: [{ description: __('pages.home.description') }],
    }),
    styles: require('./styles.module.less'),
})(PageHome);
